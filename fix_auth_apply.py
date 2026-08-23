with open('src/pages/ApplyMentorPage.tsx', 'r') as f:
    content = f.read()

import re
old = "export const ApplyMentorPage: React.FC = () => {\n"
new = "export const ApplyMentorPage: React.FC = () => {\n  const navigate = useNavigate();\n\n  useEffect(() => {\n    const session = getAuthSession();\n    if (!session.isLoggedIn) {\n      navigate('/auth/login', { replace: true });\n    }\n  }, [navigate]);\n\n"
content = content.replace(old, new)

with open('src/pages/ApplyMentorPage.tsx', 'w') as f:
    f.write(content)
