with open('src/pages/OnboardingPage.tsx', 'r') as f:
    content = f.read()

import re

# Find the start of the duplication which is the anomalous return ()
# and the end which is the original handleSubmit closing brace
bad_block = re.search(r'  return \(\) => document\.removeEventListener\(\'mousedown\', handleClickOutside\);\n  \}, \[\]\);\n\n  const educationOptions =.*?setIsGenerating\(false\);\n    }\n  };\n', content, re.DOTALL)

if bad_block:
    content = content.replace(bad_block.group(0), "")
    with open('src/pages/OnboardingPage.tsx', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Failed to find bad block")
