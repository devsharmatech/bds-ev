import { supabase } from "@/lib/supabaseAdmin";
import { generateMembershipCode } from "@/lib/membershipCode";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");

    let body;
    let idCardFile = null;
    let personalPhotoFile = null;

    if (isMultipart) {
      const formData = await req.formData();
      
      // Extract form fields
      body = {
        fullNameEng: formData.get("fullNameEng"),
        fullNameArb: formData.get("fullNameArb") || "",
        email: formData.get("email"),
        password: formData.get("password"),
        mobile: formData.get("mobile"),
        cpr: formData.get("cpr") || "",
        gender: formData.get("gender") || "",
        nationality: formData.get("nationality") || "",
        category: formData.get("category"),
        workSector: formData.get("workSector"),
        employer: formData.get("employer"),
        position: formData.get("position"),
        specialty: formData.get("specialty") || "",
        address: formData.get("address") || "",
        membershipType: formData.get("membershipType"),
        subscriptionPlanId: formData.get("subscriptionPlanId") || "",
        typeOfApplication: formData.get("typeOfApplication"),
        membershipDate: formData.get("membershipDate") || new Date().toISOString().split("T")[0],
        licenseNumber: formData.get("licenseNumber") || "",
        yearsOfExperience: formData.get("yearsOfExperience") || "",
      };

      // Extract files
      idCardFile = formData.get("id_card");
      personalPhotoFile = formData.get("personal_photo");
    } else {
      body = await req.json();
    }

    const {
      fullNameEng,
      fullNameArb,
      email,
      password,
      mobile,
      cpr,
      gender,
      nationality,
      category,
      workSector,
      employer,
      position,
      specialty,
      address,
      membershipType, // "free" | "paid"
      subscriptionPlanId, // UUID of selected subscription plan
      typeOfApplication,
      membershipDate,
      licenseNumber,
      yearsOfExperience,
    } = body;

    // --------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------
    const nationalityNorm = (nationality || '').toString().trim().toLowerCase();
    if (!fullNameEng || !email || !password || !mobile) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing" },
        { status: 400 }
      );
    }

    // CPR optional for all; if provided must be 9 digits
    if (cpr) {
      if (!/^\d{9}$/.test((cpr || '').toString().trim())) {
        return NextResponse.json(
          { success: false, message: "If provided, CPR must be 9 digits" },
          { status: 400 }
        );
      }
    }

    // --------------------------------------------------
    // DUPLICATE EMAIL CHECK
    // --------------------------------------------------
    const { data: emailExists } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (emailExists) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // DUPLICATE CPR CHECK
    // --------------------------------------------------
    if (cpr) {
      const { data: cprExists } = await supabase
        .from("member_profiles")
        .select("id")
        .eq("cpr_id", cpr)
        .maybeSingle();

      if (cprExists) {
        return NextResponse.json(
          { success: false, message: "CPR already registered" },
          { status: 409 }
        );
      }
    }

    // --------------------------------------------------
    // MEMBERSHIP LOGIC
    // --------------------------------------------------
    // Get subscription plan details if provided
    let subscriptionPlan = null;
    let isPaid = membershipType === "paid";
    let amount = 0;
    let registrationFee = 0;
    let annualFee = 0;

    if (subscriptionPlanId) {
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', subscriptionPlanId)
        .eq('is_active', true)
        .single();

      if (!planError && plan) {
        subscriptionPlan = plan;
        registrationFee = plan.registration_waived ? 0 : (plan.registration_fee || 0);
        annualFee = plan.annual_waived ? 0 : (plan.annual_fee || 0);
        amount = registrationFee + annualFee;
        isPaid = amount > 0;
      }
    } else {
      // Fallback to old logic if no plan ID provided
      amount = isPaid ? 40 : 0;
    }

    const startDate = isPaid
      ? new Date()
      : null;

    const endDate = isPaid
      ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      : null;

    // --------------------------------------------------
    // PASSWORD HASH
    // --------------------------------------------------
    const passwordHash = await bcrypt.hash(password, 10);

    // --------------------------------------------------
    // CREATE USER
    // --------------------------------------------------
    // membership_type must be "free" or "paid" (database constraint)
    // The actual subscription plan name is stored in current_subscription_plan_name
    // IMPORTANT: If payment is required, user status should be "pending" until payment is confirmed
    const membershipTypeValue = isPaid ? "paid" : "free";
    const membershipStatus = isPaid ? "pending" : "active"; // Pending until payment is confirmed
    
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        full_name: fullNameEng,
        full_name_ar: fullNameArb,
        email,
        password_hash: passwordHash,
        phone: mobile,
        mobile: mobile,
        role: "member",
        membership_type: membershipTypeValue,
        current_subscription_plan_id: subscriptionPlan ? subscriptionPlan.id : null,
        current_subscription_plan_name: subscriptionPlan ? subscriptionPlan.display_name : null,
        membership_expiry_date: endDate,
        membership_status: membershipStatus, // "pending" if payment required, "active" if free
      })
      .select()
      .single();

    if (userError) throw userError;

    // Assign membership code in format BDS-00001 (no year)
    const membershipCode = await generateMembershipCode();
    if (membershipCode) {
      await supabase
        .from("users")
        .update({ membership_code: membershipCode })
        .eq("id", user.id);
      user.membership_code = membershipCode;
    }

    // --------------------------------------------------
    // HANDLE FILE UPLOADS (if provided)
    // --------------------------------------------------
    let idCardUrl = null;
    let personalPhotoUrl = null;

    if (isMultipart) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
      const maxSize = 10 * 1024 * 1024; // 10MB

      // Upload ID Card
      if (idCardFile && idCardFile.size > 0) {
        if (!allowedTypes.includes(idCardFile.type)) {
          await supabase.from("users").delete().eq("id", user.id);
          return NextResponse.json(
            { success: false, message: "ID Card must be JPEG/PNG/WebP/PDF" },
            { status: 400 }
          );
        }
        if (idCardFile.size > maxSize) {
          await supabase.from("users").delete().eq("id", user.id);
          return NextResponse.json(
            { success: false, message: "ID Card file too large (max 10MB)" },
            { status: 400 }
          );
        }

        const ext = idCardFile.name.split(".").pop();
        const filename = `${uuidv4()}.${ext}`;
        const path = `verification/${user.id}/id_card_${filename}`;

        const { error: uploadError } = await supabase.storage
          .from("profile_pictures")
          .upload(path, idCardFile, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          console.error("ID Card upload error:", uploadError);
          await supabase.from("users").delete().eq("id", user.id);
          return NextResponse.json(
            { success: false, message: "Failed to upload ID Card", error: uploadError.message },
            { status: 500 }
          );
        }

        const { data: urlData } = supabase.storage.from("profile_pictures").getPublicUrl(path);
        idCardUrl = urlData.publicUrl || null;
      } else if (isMultipart && (!idCardFile || idCardFile.size === 0)) {
        await supabase.from("users").delete().eq("id", user.id);
        return NextResponse.json(
          { success: false, message: "ID Card (CPR) copy is required" },
          { status: 400 }
        );
      }

      // Upload Personal Photo
      if (personalPhotoFile && personalPhotoFile.size > 0) {
        const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedImageTypes.includes(personalPhotoFile.type)) {
          if (idCardUrl) {
            const idPath = idCardUrl.split("/").slice(-2).join("/");
            await supabase.storage.from("profile_pictures").remove([idPath]);
          }
          await supabase.from("users").delete().eq("id", user.id);
          return NextResponse.json(
            { success: false, message: "Personal Photo must be JPEG/PNG/WebP" },
            { status: 400 }
          );
        }
        if (personalPhotoFile.size > maxSize) {
          if (idCardUrl) {
            const idPath = idCardUrl.split("/").slice(-2).join("/");
            await supabase.storage.from("profile_pictures").remove([idPath]);
          }
          await supabase.from("users").delete().eq("id", user.id);
          return NextResponse.json(
            { success: false, message: "Personal Photo file too large (max 10MB)" },
            { status: 400 }
          );
        }

        const ext = personalPhotoFile.name.split(".").pop();
        const filename = `${uuidv4()}.${ext}`;
        const path = `verification/${user.id}/personal_photo_${filename}`;

        const { error: uploadError } = await supabase.storage
          .from("profile_pictures")
          .upload(path, personalPhotoFile, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          console.error("Personal Photo upload error:", uploadError);
          if (idCardUrl) {
            const idPath = idCardUrl.split("/").slice(-2).join("/");
            await supabase.storage.from("profile_pictures").remove([idPath]);
          }
          await supabase.from("users").delete().eq("id", user.id);
          return NextResponse.json(
            { success: false, message: "Failed to upload Personal Photo", error: uploadError.message },
            { status: 500 }
          );
        }

        const { data: urlData } = supabase.storage.from("profile_pictures").getPublicUrl(path);
        personalPhotoUrl = urlData.publicUrl || null;
      } else if (isMultipart && (!personalPhotoFile || personalPhotoFile.size === 0)) {
        // If FormData is sent but personal photo is missing, clean up and return error
        if (idCardUrl) {
          const idPath = idCardUrl.split("/").slice(-2).join("/");
          await supabase.storage.from("profile_pictures").remove([idPath]);
        }
        await supabase.from("users").delete().eq("id", user.id);
        return NextResponse.json(
          { success: false, message: "Personal photo is required" },
          { status: 400 }
        );
      }
    } else {
      // JSON body path: accept pre-uploaded file URLs
      idCardUrl = body.id_card_url || null;
      personalPhotoUrl = body.personal_photo_url || null;
    }

    // --------------------------------------------------
    // CREATE MEMBER PROFILE
    // --------------------------------------------------
    const { error: profileError } = await supabase
      .from("member_profiles")
      .insert({
        user_id: user.id,
        gender,
        nationality,
        category,
        work_sector: workSector,
        employer,
        position,
        specialty,
        address,
        cpr_id: cpr || null,
        type_of_application: typeOfApplication,
        membership_date: membershipDate || new Date(),
        license_number: licenseNumber || null,
        years_of_experience: yearsOfExperience || null,
        id_card_url: idCardUrl,
        personal_photo_url: personalPhotoUrl,
      });

    if (profileError) {
      // Clean up uploaded files if profile creation fails
      if (idCardUrl) {
        const path = idCardUrl.split("/").slice(-2).join("/");
        await supabase.storage.from("profile_pictures").remove([path]);
      }
      if (personalPhotoUrl) {
        const path = personalPhotoUrl.split("/").slice(-2).join("/");
        await supabase.storage.from("profile_pictures").remove([path]);
      }
      await supabase.from("users").delete().eq("id", user.id);
      throw profileError;
    }

    // --------------------------------------------------
    // CREATE SUBSCRIPTION AND PAYMENT RECORDS
    // --------------------------------------------------
    let newSubscription = null;
    let registrationPaymentId = null;
    let annualPaymentId = null;

    if (subscriptionPlan) {
      const { data: subscriptionData, error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          subscription_plan_id: subscriptionPlan.id,
          subscription_plan_name: subscriptionPlan.name,
          status: isPaid ? 'pending_payment' : 'active',
          started_at: startDate ? startDate.toISOString() : new Date().toISOString(),
          expires_at: endDate ? endDate.toISOString() : null,
          registration_paid: subscriptionPlan.registration_waived,
          annual_paid: subscriptionPlan.annual_waived,
          auto_renew: false
        })
        .select()
        .single();

      if (subError) {
        console.error('Error creating subscription:', subError);
        // Continue with registration even if subscription creation fails
      } else {
        newSubscription = subscriptionData;

        if (isPaid && newSubscription) {
          // Create payment records for paid subscriptions
          if (registrationFee > 0) {
            const { data: regPayment, error: regPaymentError } = await supabase
              .from('membership_payments')
              .insert({
                user_id: user.id,
                payment_type: 'subscription_registration',
                subscription_id: newSubscription.id,
                amount: registrationFee,
                currency: 'BHD',
                paid: false,
                reference: `SUB-REG-${newSubscription.id.substring(0, 8).toUpperCase()}`
              })
              .select()
              .single();

            if (regPaymentError) {
              console.error('Error creating registration payment:', regPaymentError);
            } else {
              registrationPaymentId = regPayment.id;
            }
          }

          if (annualFee > 0) {
            const { data: annPayment, error: annPaymentError } = await supabase
              .from('membership_payments')
              .insert({
                user_id: user.id,
                payment_type: 'subscription_annual',
                subscription_id: newSubscription.id,
                amount: annualFee,
                currency: 'BHD',
                paid: false,
                reference: `SUB-ANN-${newSubscription.id.substring(0, 8).toUpperCase()}`
              })
              .select()
              .single();

            if (annPaymentError) {
              console.error('Error creating annual payment:', annPaymentError);
            } else {
              annualPaymentId = annPayment.id;
            }
          }
        }
      }
    } else {
      // Fallback: Create old-style membership payment record
      const { error: paymentError } = await supabase
        .from("membership_payments")
        .insert({
          user_id: user.id,
          payment_type: isPaid ? "paid" : "free",
          amount,
          paid: !isPaid, // FREE auto-approved
          membership_start_date: startDate,
          membership_end_date: endDate,
        });

      if (paymentError) throw paymentError;
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------
    // Get payment IDs if they were created (already set above, but fetch if needed)
    let subscriptionId = null;

    if (subscriptionPlan && isPaid && newSubscription) {
      subscriptionId = newSubscription.id;
      
      // If payment IDs weren't set (e.g., due to errors), try to fetch them
      if (!registrationPaymentId && !annualPaymentId) {
        const { data: payments } = await supabase
          .from('membership_payments')
          .select('id, payment_type')
          .eq('subscription_id', subscriptionId)
          .eq('paid', false);

        if (payments) {
          payments.forEach(payment => {
            if (payment.payment_type === 'subscription_registration') {
              registrationPaymentId = payment.id;
            } else if (payment.payment_type === 'subscription_annual') {
              annualPaymentId = payment.id;
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: {
        user_id: user.id,
        email: user.email,
        membership: isPaid ? "paid" : "free",
        payable_amount: amount,
        membership_valid_till: endDate,
        paymentRequired: isPaid,
        paymentDetails: isPaid ? {
          subscription_id: subscriptionId,
          registration_payment_id: registrationPaymentId,
          annual_payment_id: annualPaymentId,
          registration_fee: registrationFee,
          annual_fee: annualFee,
          total_amount: amount
        } : null
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    );
  }
}
