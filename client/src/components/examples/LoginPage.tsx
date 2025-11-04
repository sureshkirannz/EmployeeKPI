import LoginPage from '../LoginPage';

export default function LoginPageExample() {
  const handleLogin = (username: string, password: string) => {
    console.log('Login triggered:', { username, password });
  };

  return <LoginPage onLogin={handleLogin} />;
}
