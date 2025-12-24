"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FileQuestion, CheckCircle, XCircle, Clock, Eye, Pencil, Trash2 } from "lucide-react";

export default function QuestionItem({ question, isExpanded, onToggle, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="border rounded-lg overflow-hidden mb-3">
      <div
        className="flex justify-between items-start bg-gray-50 p-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="font-medium flex items-center gap-2">
            <FileQuestion size={16} className="text-[#03215F]" />
            {question.question_text}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Correct: {question.correct_option?.toUpperCase() || "—"}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="text-[#ECCF0F]"><Pencil size={14} /></button>
          <button onClick={onDelete} className="text-[#b8352d]"><Trash2 size={14} /></button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white p-3 border-t"
          >
            {question.options?.map((opt) => (
              <div
                key={opt.option_key}
                className={`p-2 rounded mb-1 ${
                  question.correct_option === opt.option_key
                    ? "bg-[#AE9B66] border-l-4 border-[#AE9B66]"
                    : "bg-gray-50"
                }`}
              >
                <strong>{opt.option_key.toUpperCase()}.</strong> {opt.content}
              </div>
            ))}

            <div className="flex gap-2 mt-3">
              <button onClick={() => onStatusChange(question.id, "approved")} className="text-[#AE9B66] text-xs">
                <CheckCircle size={14} /> Approve
              </button>
              <button onClick={() => onStatusChange(question.id, "pending")} className="text-[#ECCF0F] text-xs">
                <Clock size={14} /> Pending
              </button>
              <button onClick={() => onStatusChange(question.id, "rejected")} className="text-[#b8352d] text-xs">
                <XCircle size={14} /> Reject
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
