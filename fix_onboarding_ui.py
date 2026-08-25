with open('src/pages/OnboardingPage.tsx', 'r') as f:
    content = f.read()

old_error_block = """          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}"""

new_blocks = """          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-3 text-green-400 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}"""

if old_error_block in content:
    content = content.replace(old_error_block, new_blocks)
    with open('src/pages/OnboardingPage.tsx', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Failed to find old error block")
