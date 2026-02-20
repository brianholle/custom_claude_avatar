// Avatar definitions for Claude CLI customization
// Each avatar has readable preview art and a structured definition
// that compiles to React createElement calls.
//
// Line types:
//   { ref: "q" }                              - the face variable (bare identifier)
//   { text: "...", color: "..." }             - single colored text span
//   { args: [...], color: "..." }             - multi-arg span (e.g. mouth)
//   { segments: [...] }                       - multi-color line (e.g. eyes)

const BASE_EYES = {
    segments: [
        { text: "▝▜", color: "clawd_body" },
        { text: "█████", color: "clawd_body", backgroundColor: "clawd_background" },
        { text: "▛▘", color: "clawd_body" },
    ],
};

const BASE_MOUTH = {
    args: ["  ", "▘▘ ▝▝", "  "],
    color: "clawd_body",
};

function birthdayHat(color, label) {
    return {
        name: `Birthday Hat (${label})`,
        menuLabel: `Birthday Hat ✦ - ${label}`,
        preview: `
            ✦
            │
           ▄█▄
          ▐▛███▜▌
         ▝▜█████▛▘
           ▘▘ ▝▝
        `,
        layout: "column",
        lines: [
            { text: "    ✦    ", color },
            { text: "    │    ", color },
            { text: "   ▄█▄   ", color },
            { ref: "q" },
            BASE_EYES,
            BASE_MOUTH,
        ],
    };
}

const avatars = {
    party_hat: {
        name: "Party Hat",
        menuLabel: "Party Hat (▲▲▲)",
        preview: `
           ▲▲▲
          ▐▛███▜▌
         ▝▜█████▛▘
           ▘▘ ▝▝
        `,
        layout: "column",
        lines: [
            { text: "   ▲▲▲   ", color: "clawd_body" },
            { ref: "q" },
            BASE_EYES,
            BASE_MOUTH,
        ],
    },

    crown: {
        name: "Crown",
        menuLabel: "Crown (█▄█▄█)",
        preview: `
          █▄█▄█
          ▐▛███▜▌
         ▝▜█████▛▘
           ▘▘ ▝▝
        `,
        layout: "column",
        lines: [
            { text: "  █▄█▄█", color: "warning" },
            { ref: "q" },
            BASE_EYES,
            BASE_MOUTH,
        ],
    },

    birthday_hat_red:    birthdayHat("error", "Red"),
    birthday_hat_green:  birthdayHat("success", "Green"),
    birthday_hat_yellow: birthdayHat("warning", "Yellow"),
    birthday_hat_purple: birthdayHat("permission", "Purple"),

    cat_ears: {
        name: "Cat Ears",
        menuLabel: "Cat Ears (▲   ▲)",
        preview: `
           ▲    ▲
          ▐▛███▜▌
         ▝▜█████▛▘
           ▘▘ ▝▝
        `,
        layout: "column",
        lines: [
            { text: "  ▲    ▲", color: "clawd_body" },
            { ref: "q" },
            BASE_EYES,
            BASE_MOUTH,
        ],
    },

    thinking_cap: {
        name: "Thinking Cap",
        menuLabel: "Top hat (🎩)",
        preview: `
            🎩
          ▐▛███▜▌
         ▝▜█████▛▘
           ▘▘ ▝▝
        `,
        layout: "column",
        lines: [
            { text: "  🎩   ", color: "clawd_body" },
            { ref: "q" },
            BASE_EYES,
            BASE_MOUTH,
        ],
    },

    bloomberg_terminal: {
        name: "Bloomberg Terminal",
        menuLabel: "Bloomberg Terminal (dual monitors icon)",
        preview: `
          ▐▛███▜▌ ▓▓ ▓▓
         ▝▜█████▛▘  ┻
           ▘▘ ▝▝
        `,
        layout: "row",
        rows: [
            {
                left: { ref: "q" },
                right: { text: " ▓▓ ▓▓", color: "subtle" },
            },
            {
                left: BASE_EYES,
                right: { text: "  ┻  ", color: "subtle" },
            },
            {
                left: BASE_MOUTH,
            },
        ],
    },
};

module.exports = { avatars, BASE_EYES, BASE_MOUTH };
