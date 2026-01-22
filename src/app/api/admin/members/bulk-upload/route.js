import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

/**
 * Parse date string to YYYY-MM-DD format
 * Handles formats: DD-MM-YYYY, DD/MM/YYYY, MM-DD-YYYY, MM/DD/YYYY, YYYY-MM-DD
 */
function parseDate(dateStr) {
  if (!dateStr || !dateStr.trim()) return null;
  
  const str = dateStr.trim();
  
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  
  // Try DD-MM-YYYY or DD/MM/YYYY format
  const ddmmyyyy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0');
    const month = ddmmyyyy[2].padStart(2, '0');
    const year = ddmmyyyy[3];
    
    // Check if day > 12, then it's DD-MM-YYYY
    if (parseInt(day) > 12) {
      return `${year}-${month}-${day}`;
    }
    // Check if month > 12, then it's MM-DD-YYYY
    if (parseInt(month) > 12) {
      return `${year}-${day}-${month}`;
    }
    // Assume DD-MM-YYYY by default (more common in Bahrain)
    return `${year}-${month}-${day}`;
  }
  
  // Try to parse as date
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  
  return null;
}

/**
 * Bulk upload members from CSV
 * POST /api/admin/members/bulk-upload
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read CSV file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, error: 'CSV file must have at least a header row and one data row' },
        { status: 400 }
      );
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    // Required fields
    const requiredFields = ['email', 'full_name', 'membership_code'];
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required columns: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Parse CSV rows
    const rows = [];
    const errors = [];
    const results = {
      success: [],
      failed: [],
      total: lines.length - 1,
      successCount: 0,
      failedCount: 0
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        // Parse CSV row (handling quoted values)
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        if (values.length !== headers.length) {
          errors.push({
            row: i + 1,
            error: `Column count mismatch. Expected ${headers.length}, got ${values.length}`
          });
          continue;
        }

        // Create row object
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.replace(/^"|"$/g, '') || '';
        });

        // Validate required fields
        const rowErrors = [];
        if (!row.email || !row.email.trim()) {
          rowErrors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
          rowErrors.push('Invalid email format');
        }

        if (!row.full_name || !row.full_name.trim()) {
          rowErrors.push('Full name is required');
        }

        if (!row.membership_code || !row.membership_code.trim()) {
          rowErrors.push('Membership code is required');
        }

        if (rowErrors.length > 0) {
          errors.push({
            row: i + 1,
            email: row.email || 'N/A',
            errors: rowErrors
          });
          results.failed.push({
            row: i + 1,
            data: row,
            errors: rowErrors
          });
          continue;
        }

        rows.push({
          rowNumber: i + 1,
          data: row
        });
      } catch (parseError) {
        errors.push({
          row: i + 1,
          error: `Parse error: ${parseError.message}`
        });
        results.failed.push({
          row: i + 1,
          error: parseError.message
        });
      }
    }

    // Check for duplicate emails and membership codes in CSV
    const emailSet = new Set();
    const membershipCodeSet = new Set();
    const duplicateErrors = [];

    rows.forEach(({ rowNumber, data }) => {
      const email = data.email.trim().toLowerCase();
      const membershipCode = data.membership_code.trim();

      if (emailSet.has(email)) {
        duplicateErrors.push({
          row: rowNumber,
          email: data.email,
          error: 'Duplicate email in CSV'
        });
        results.failed.push({
          row: rowNumber,
          data,
          errors: ['Duplicate email in CSV']
        });
        return;
      }
      emailSet.add(email);

      if (membershipCodeSet.has(membershipCode)) {
        duplicateErrors.push({
          row: rowNumber,
          membership_code: membershipCode,
          error: 'Duplicate membership code in CSV'
        });
        results.failed.push({
          row: rowNumber,
          data,
          errors: ['Duplicate membership code in CSV']
        });
        return;
      }
      membershipCodeSet.add(membershipCode);
    });

    // Process valid rows
    for (const { rowNumber, data } of rows) {
      // Skip if already marked as failed
      if (results.failed.some(f => f.row === rowNumber)) {
        continue;
      }

      try {
        let email = data.email.trim().toLowerCase();
        const membershipCode = data.membership_code.trim();

        // If email already exists, generate a new unique email by adding a number before '@'
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', email)
          .maybeSingle();

        if (existingUser) {
          const atIndex = email.indexOf('@');
          if (atIndex === -1) {
            throw new Error(`Invalid email format: ${email}`);
          }

          const localPart = email.slice(0, atIndex);
          const domainPart = email.slice(atIndex + 1);

          let suffix = 1;
          let newEmail = email;
          // Try a series of suffixed emails until one is unique in DB
          while (suffix < 1000) {
            newEmail = `${localPart}${suffix}@${domainPart}`;

            const { data: conflict } = await supabase
              .from('users')
              .select('id')
              .eq('email', newEmail)
              .maybeSingle();

            if (!conflict) {
              email = newEmail;
              break;
            }
            suffix++;
          }

          if (email === data.email.trim().toLowerCase()) {
            throw new Error(`Could not generate unique email for ${email}`);
          }
        }

        // Check if membership code already exists
        const { data: existingMember } = await supabase
          .from('users')
          .select('id, membership_code')
          .eq('membership_code', membershipCode)
          .single();

        if (existingMember) {
          results.failed.push({
            row: rowNumber,
            data,
            errors: [`Membership code ${membershipCode} already exists`]
          });
          results.failedCount++;
          continue;
        }

        // Generate password if not provided (default: membership_code + "123")
        const password = data.password?.trim() || `${membershipCode}123`;
        const passwordHash = await bcrypt.hash(password, 10);

        // Handle subscription plan
        let subscriptionPlanId = null;
        let subscriptionPlanName = null;
        
        if (data.subscription_plan?.trim()) {
          const planName = data.subscription_plan.trim().toLowerCase();
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('id, display_name')
            .eq('name', planName)
            .single();
          
          if (plan) {
            subscriptionPlanId = plan.id;
            subscriptionPlanName = plan.display_name;
          }
        }

        // Normalize membership type and status to match database constraints
        const rawMembershipType = (data.membership_type || '').trim().toLowerCase();
        // Only 'paid' or 'free' are allowed.
        // If membership_type is missing but a subscription plan is provided, treat as 'paid'.
        let membershipType = 'free';
        if (rawMembershipType === 'paid' || rawMembershipType === 'free') {
          membershipType = rawMembershipType;
        } else if (!rawMembershipType && subscriptionPlanId) {
          // Infer paid membership when a valid subscription plan exists but membership_type is empty
          membershipType = 'paid';
        }

        const rawMembershipStatus = (data.membership_status || '').trim().toLowerCase();
        // Allowed: 'active', 'inactive', 'blocked', 'pending' (default 'active')
        const allowedStatuses = ['active', 'inactive', 'blocked', 'pending'];
        const membershipStatus = allowedStatuses.includes(rawMembershipStatus)
          ? rawMembershipStatus
          : 'active';

        // Parse membership expiry date (from CSV column `membership_expiry_date`, if provided)
        let membershipExpiryDate = null;
        if (data.membership_expiry_date && data.membership_expiry_date.trim()) {
          const parsedExpiry = parseDate(data.membership_expiry_date);
          if (parsedExpiry) {
            // Store as ISO timestamp (midnight for that date)
            membershipExpiryDate = new Date(parsedExpiry).toISOString();
          }
        }

        // Create user
        const { data: user, error: userError } = await supabase
          .from('users')
          .insert({
            email: email,
            password_hash: passwordHash,
            full_name: data.full_name.trim(),
            phone: data.phone?.trim() || null,
            mobile: data.mobile?.trim() || data.phone?.trim() || null,
            role: 'member',
            membership_code: membershipCode,
            membership_status: membershipStatus,
            membership_type: membershipType,
            membership_expiry_date: membershipExpiryDate,
            profile_image: data.profile_image?.trim() || null,
            current_subscription_plan_id: subscriptionPlanId,
            current_subscription_plan_name: subscriptionPlanName
          })
          .select()
          .single();

        if (userError) {
          results.failed.push({
            row: rowNumber,
            data,
            errors: [userError.message]
          });
          results.failedCount++;
          continue;
        }

        // Create member profile
        const profileData = {
          user_id: user.id,
          gender: data.gender?.trim() || null,
          dob: parseDate(data.dob),
          address: data.address?.trim() || null,
          city: data.city?.trim() || null,
          state: data.state?.trim() || null,
          pin_code: data.pin_code?.trim() || null,
          cpr_id: data.cpr_id?.trim() || null,
          nationality: data.nationality?.trim() || null,
          type_of_application: data.type_of_application?.trim() || null,
          membership_date: parseDate(data.membership_date) || new Date().toISOString().split('T')[0],
          work_sector: data.work_sector?.trim() || null,
          employer: data.employer?.trim() || null,
          position: data.position?.trim() || null,
          specialty: data.specialty?.trim() || null,
          category: data.category?.trim() || null,
          id_card_url: data.id_card_url?.trim() || null,
          personal_photo_url: data.personal_photo_url?.trim() || null
        };

        const { error: profileError } = await supabase
          .from('member_profiles')
          .insert(profileData);

        if (profileError) {
          // Rollback user creation
          await supabase.from('users').delete().eq('id', user.id);
          results.failed.push({
            row: rowNumber,
            data,
            errors: [`Profile creation failed: ${profileError.message}`]
          });
          results.failedCount++;
          continue;
        }

        // Create subscription record if subscription plan is provided
        if (subscriptionPlanId && subscriptionPlanName) {
          // Calculate expiry date (1 year from now)
          const startedAt = data.membership_date && parseDate(data.membership_date)
            ? new Date(parseDate(data.membership_date)).toISOString()
            : new Date().toISOString();
          const expiresAt = data.membership_expiry_date && parseDate(data.membership_expiry_date)
            ? new Date(parseDate(data.membership_expiry_date)).toISOString()
            : (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString(); })();
          const { error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: user.id,
              subscription_plan_id: subscriptionPlanId,
              subscription_plan_name: subscriptionPlanName,
              status: 'active',
              started_at: startedAt,
              expires_at: expiresAt,
              registration_paid: true,
              annual_paid: true
            });

          if (subscriptionError) {
            console.error('Subscription creation error:', subscriptionError);
            // Don't fail the whole row, just log the error
          }
        }

        results.success.push({
          row: rowNumber,
          email: email,
          full_name: data.full_name.trim(),
          membership_code: membershipCode,
          subscription_plan: subscriptionPlanName || 'None'
        });
        results.successCount++;

      } catch (error) {
        results.failed.push({
          row: rowNumber,
          data,
          errors: [error.message || 'Unknown error']
        });
        results.failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.total} rows. ${results.successCount} succeeded, ${results.failedCount} failed.`,
      results
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to process bulk upload' 
      },
      { status: 500 }
    );
  }
}

