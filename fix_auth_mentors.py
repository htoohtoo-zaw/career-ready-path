with open('src/pages/MentorsPage.tsx', 'r') as f:
    content = f.read()

old = "export const MentorsPage: React.FC = () => {\n  const navigate = useNavigate();\n"
new = "export const MentorsPage: React.FC = () => {\n  const navigate = useNavigate();\n\n  useEffect(() => {\n    const session = getAuthSession();\n    if (!session.isLoggedIn) {\n      navigate('/auth/login', { replace: true });\n    }\n  }, [navigate]);\n\n"
content = content.replace(old, new)

with open('src/pages/MentorsPage.tsx', 'w') as f:
    f.write(content)
