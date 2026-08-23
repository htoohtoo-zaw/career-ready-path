with open('src/pages/MentorProfilePage.tsx', 'r') as f:
    content = f.read()

import re

old = """export const MentorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();"""

new = """export const MentorProfilePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getAuthSession();
    if (!session.isLoggedIn) {
      navigate('/auth/login', { replace: true });
    }
  }, [navigate]);

  const { id } = useParams<{ id: string }>();"""

content = content.replace(old, new)

with open('src/pages/MentorProfilePage.tsx', 'w') as f:
    f.write(content)
