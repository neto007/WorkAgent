// Condition types
export const ConditionTypeEnum = {
    PREVIOUS_OUTPUT: "previous-output",
} as const;

export type ConditionTypeEnum = typeof ConditionTypeEnum[keyof typeof ConditionTypeEnum];

export type ConditionType = {
    id: string;
    type: ConditionTypeEnum;
    data: {
        field: string;
        operator: string;
        value: string;
    };
};

// Message types
export const MessageTypeEnum = {
    TEXT: "text",
    IMAGE: "image",
    FILE: "file",
    VIDEO: "video",
} as const;

export type MessageTypeEnum = typeof MessageTypeEnum[keyof typeof MessageTypeEnum];

export type MessageType = {
    type: MessageTypeEnum;
    content: string;
};

// Delay types
export type DelayType = {
    value: number;
    unit: string;
    description?: string;
};
