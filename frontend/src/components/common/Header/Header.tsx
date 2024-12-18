/**
 * @summary Reusable BC Gov Header Component
 */
import { useSSO } from '@bcgov/citz-imb-sso-react';
import logo from '/logo-banner.svg';

import { env } from '@/env';
import { HeaderWrapper, Heading, Banner, Image, StyledLink } from './header.styles';
import { Button } from '../Button/Button';
import { ButtonWrapper } from '../../../views/LandingPage/landingPage.styles';

export default function Header() {
  const { login, logout, isAuthenticated } = useSSO();

  const handleLoginButton = () => {
    if (isAuthenticated) {
      logout(env.VITE_BACKEND_URL);
    } else {
      login({
        backendURL: env.VITE_BACKEND_URL,
        idpHint: 'idir',
        postLoginRedirectURL: '/admin',
      });
    }
  };

  return (
    <HeaderWrapper>
      <Banner>
        <StyledLink href="/">
          <Image
            src={logo}
            alt="Go to the Home page"
          />
        </StyledLink>
        <StyledLink href="/">
          <Heading>Nutrient Management Calculator</Heading>
        </StyledLink>
        <ButtonWrapper>
          <Button
            handleClick={handleLoginButton}
            variant="secondary"
            size="sm"
            disabled={false}
            text={isAuthenticated ? 'Logout' : 'Admin Login'}
            aria-label={isAuthenticated ? 'Logout' : 'Admin Login'}
          />
        </ButtonWrapper>
      </Banner>
    </HeaderWrapper>
  );
}
