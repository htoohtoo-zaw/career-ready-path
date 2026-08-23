files = [
    'src/pages/RoadmapDetailPage.tsx',
    'src/pages/ApplyMentorPage.tsx',
    'src/pages/MentorProfilePage.tsx',
    'src/pages/MentorsPage.tsx',
    'src/pages/RoadmapsPage.tsx'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Look for the exact block inserted by the previous python scripts
    hack_block = """  useEffect(() => {
    const session = getAuthSession();
    if (!session.isLoggedIn) {
      navigate('/auth/login', { replace: true });
    }
  }, [navigate]);

"""
    content = content.replace(hack_block, "")

    with open(file, 'w') as f:
        f.write(content)
