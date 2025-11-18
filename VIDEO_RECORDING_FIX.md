# Video Recording Fix

## Issue
"Failed to start recording" error when clicking Start Recording button.

## Root Cause
Browser didn't support the hardcoded VP9 codec (`video/webm;codecs=vp9`).

## Solution
Implemented codec detection with fallback chain:
1. VP9 (best quality)
2. VP8 (good compatibility)
3. WebM (generic)
4. MP4 (Safari/iOS)
5. Browser default (fallback)

## Changes Made
Updated `apps/web/src/Capture.jsx`:
- Added `MediaRecorder.isTypeSupported()` checks
- Tries codecs in order of preference
- Dynamically sets file extension (.webm or .mp4)
- Better error handling with detailed messages
- Validates data chunks before creating blob

## Testing
1. Refresh the page (Ctrl+R or Cmd+R)
2. Go to Capture page
3. Start Camera
4. Click "Start Recording"
5. Should now work on all browsers

## Supported Browsers
- ✅ Chrome/Edge: VP9 or VP8
- ✅ Firefox: VP9 or VP8
- ✅ Safari: MP4
- ✅ Opera: VP9 or VP8
- ✅ Mobile browsers: Auto-detect best codec
