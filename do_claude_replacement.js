const fs = require('fs');
const { avatars } = require('./avatars');

// Auto-detect minified variable names from the CLI bundle
function detectVariables(content) {
    // Find the avatar pattern to extract variable names
    // Using actual unicode characters instead of escape sequences
    const avatarMatch = content.match(/([a-z0-9]+)\.createElement\((\w+),\{flexDirection:"column"\},(\w+),([a-z0-9]+)\.createElement\((\w+),null,([a-z0-9]+)\.createElement\((\w+),\{color:"clawd_body"\},"▝▜"\)/);

    if (!avatarMatch) {
        throw new Error('Could not detect avatar pattern. CLI structure may have changed significantly.');
    }

    const [, ceNamespace, box, face, , text] = avatarMatch;

    return {
        CE: `${ceNamespace}.createElement`,
        BOX: box,
        TEXT: text,
        FACE: face
    };
}

// --- Helpers ---

function propsString(props) {
    if (!props || Object.keys(props).length === 0) return 'null';
    const entries = Object.entries(props).map(([k, v]) => `${k}:"${v}"`);
    return `{${entries.join(',')}}`;
}

function createCompilers(vars) {
    const { CE, BOX, TEXT } = vars;

    function compileLine(line) {
        if (line.ref) {
            return line.ref;
        }
        if (line.segments) {
            const children = line.segments.map(seg => {
                const props = { color: seg.color };
                if (seg.backgroundColor) props.backgroundColor = seg.backgroundColor;
                return `${CE}(${TEXT},${propsString(props)},"${seg.text}")`;
            });
            return `${CE}(${TEXT},null,${children.join(',')})`;
        }
        if (line.args) {
            const argsStr = line.args.map(a => `"${a}"`).join(',');
            return `${CE}(${TEXT},{color:"${line.color}"},${argsStr})`;
        }
        if (line.text !== undefined) {
            const props = { color: line.color };
            if (line.backgroundColor) props.backgroundColor = line.backgroundColor;
            return `${CE}(${TEXT},${propsString(props)},"${line.text}")`;
        }
        throw new Error('Unknown line type: ' + JSON.stringify(line));
    }

    function compileAvatar(avatar) {
        if (avatar.layout === 'column') {
            const children = avatar.lines.map(compileLine);
            return `${CE}(${BOX},{flexDirection:"column"},${children.join(',')})`;
        }
        if (avatar.layout === 'row') {
            const rows = avatar.rows.map(row => {
                const left = compileLine(row.left);
                if (row.right) {
                    const right = compileLine(row.right);
                    return `${CE}(${BOX},{flexDirection:"row"},${left},${right})`;
                }
                return `${CE}(${BOX},{flexDirection:"row"},${left})`;
            });
            return `${CE}(${BOX},{flexDirection:"column"},${rows.join(',')})`;
        }
        throw new Error('Unknown layout: ' + avatar.layout);
    }

    return { compileLine, compileAvatar };
}

// --- Main ---

const cliPath = process.argv[2];
const avatarKey = process.argv[3];
const dryRun = process.argv.includes('--dry-run');

if (!cliPath || !avatarKey) {
    console.error('Usage: node do_claude_replacement.js <cli_path> <avatar_key> [--dry-run]');
    process.exit(1);
}

const avatar = avatars[avatarKey];
if (!avatar) {
    console.error(`Unknown avatar: ${avatarKey}`);
    console.error(`Available: ${Object.keys(avatars).join(', ')}`);
    process.exit(1);
}

let content = fs.readFileSync(cliPath, 'utf8');

// Auto-detect variable names from the current CLI bundle
const vars = detectVariables(content);
const { CE, BOX, TEXT, FACE } = vars;
const { compileAvatar } = createCompilers(vars);

// Find the search prefix dynamically - must be the one near the avatar pattern
// Look for the memo_cache_sentinel that appears just before the avatar
const prefixMatch = content.match(/(\w\[\d+\]===Symbol\.for\("react\.memo_cache_sentinel"\)\)\w=)[a-z0-9]+\.createElement\(\w+,\{flexDirection:"column"\},\w+,[a-z0-9]+\.createElement\(\w+,null,[a-z0-9]+\.createElement\(\w+,\{color:"clawd_body"\},"▝▜"\)/);
if (!prefixMatch) {
    console.error('Could not find avatar memo cache sentinel pattern in CLI file.');
    process.exit(1);
}
const SEARCH_PREFIX = prefixMatch[1];

// Build the original avatar pattern using detected variables
const ORIGINAL_AVATAR = [
    `${CE}(${BOX},{flexDirection:"column"},${FACE},`,
    `${CE}(${TEXT},null,`,
    `${CE}(${TEXT},{color:"clawd_body"},"\u259D\u259C"),`,
    `${CE}(${TEXT},{color:"clawd_body",backgroundColor:"clawd_background"},"\u2588\u2588\u2588\u2588\u2588"),`,
    `${CE}(${TEXT},{color:"clawd_body"},"\u259B\u2598")),`,
    `${CE}(${TEXT},{color:"clawd_body"},"  ","\u2598\u2598 \u259D\u259D","  "))`,
].join('');
const SEARCH_PATTERN = SEARCH_PREFIX + ORIGINAL_AVATAR;

const compiled = compileAvatar(avatar);
const REPLACEMENT = SEARCH_PREFIX + compiled;

if (dryRun) {
    console.log('Avatar:', avatar.name);
    console.log('Detected variables:', vars);
    console.log('Compiled:', compiled);
    process.exit(0);
}

if (!content.includes(SEARCH_PATTERN)) {
    console.error('Search pattern not found in CLI file.');
    console.error('Detected variables:', vars);
    console.error('Expected pattern:', SEARCH_PATTERN.substring(0, 100) + '...');
    process.exit(1);
}

content = content.replace(SEARCH_PATTERN, REPLACEMENT);

if (!content.includes(compiled)) {
    console.error('Replacement verification failed');
    process.exit(1);
}

// Remove the "Welcome back!" banner and give that space to the avatar.
// The banner sits above the avatar in a fixed-height column (height:5).
// Removing it and increasing height to 7 gives room for taller avatars.
// Pattern is resilient to variable name changes
const welcomeMatch = content.match(/createElement\(I,\{marginTop:1\},[^)]+\),[a-z0-9]+\.createElement\(\w+,\{bold:!0\}[^)]+\)\),[a-z0-9]+\.createElement\(I,\{height:5,/);
if (welcomeMatch) {
    content = content.replace(welcomeMatch[0], 'createElement(I,{height:7,');
}

fs.writeFileSync(cliPath, content, 'utf8');
process.exit(0);
