with open('src/pages/RoadmapDetailPage.tsx', 'r') as f:
    content = f.read()

old = "export const RoadmapDetailPage: React.FC = () => {\n  const navigate = useNavigate();\n"
new = "export const RoadmapDetailPage: React.FC = () => {\n  const navigate = useNavigate();\n\n  useEffect(() => {\n    const session = getAuthSession();\n    if (!session.isLoggedIn) {\n      navigate('/auth/login', { replace: true });\n    }\n  }, [navigate]);\n\n"
content = content.replace(old, new)

with open('src/pages/RoadmapDetailPage.tsx', 'w') as f:
    f.write(content)
