with open('src/pages/MentorProfilePage.tsx', 'r') as f:
    content = f.read()

content = content.replace("  const { id } = useParams<{ id: string }>();\n  const navigate = useNavigate();", "  const { id } = useParams<{ id: string }>();")

with open('src/pages/MentorProfilePage.tsx', 'w') as f:
    f.write(content)
