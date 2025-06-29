import React, { useState } from "react";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ClockIcon,
} from "@radix-ui/react-icons";
import { GuardrailResultType } from "../types";

export interface ModerationChipProps {
  moderationCategory: string;
  moderationRationale: string;
}

function formatCategory(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function GuardrailChip({
  guardrailResult,
}: {
  guardrailResult: GuardrailResultType;
}) {
  const [expanded, setExpanded] = useState(false);

  // 状態を単一の変数に統合: "PENDING"、"PASS"、または "FAIL"
  const state =
    guardrailResult.status === "IN_PROGRESS"
      ? "PENDING"
      : guardrailResult.category === "NONE"
      ? "PASS"
      : "FAIL";

  // 状態に基づくアイコン、ラベル、スタイリングクラスの変数
  let IconComponent;
  let label: string;
  let textColorClass: string;
  switch (state) {
    case "PENDING":
      IconComponent = ClockIcon;
      label = "保留中";
      textColorClass = "text-gray-600";
      break;
    case "PASS":
      IconComponent = CheckCircledIcon;
      label = "合格";
      textColorClass = "text-green-600";
      break;
    case "FAIL":
      IconComponent = CrossCircledIcon;
      label = "失敗";
      textColorClass = "text-red-500";
      break;
    default:
      IconComponent = ClockIcon;
      label = "保留中";
      textColorClass = "text-gray-600";
  }

  return (
    <div className="text-xs">
      <div
        onClick={() => {
          // PASS/FAILの場合のみ展開状態の切り替えを許可
          if (state !== "PENDING") {
            setExpanded(!expanded);
          }
        }}
        // クリック可能な場合（PASSまたはFAIL状態）にのみポインターカーソルを追加
        className={`inline-flex items-center gap-1 rounded ${
          state !== "PENDING" ? "cursor-pointer" : ""
        }`}
      >
        ガードレール:
        <div className={`flex items-center gap-1 ${textColorClass}`}>
          <IconComponent /> {label}
        </div>
      </div>
      {/* 展開可能なコンテンツのコンテナ */}
      {state !== "PENDING" && guardrailResult.category && guardrailResult.rationale && (
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-2 text-xs">
            <strong>
              モデレーションカテゴリ: {formatCategory(guardrailResult.category)}
            </strong>
            <div>{guardrailResult.rationale}</div>
            {guardrailResult.testText && (
              <blockquote className="mt-1 border-l-2 border-gray-300 pl-2 text-gray-400">
                {guardrailResult.testText}
              </blockquote>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 