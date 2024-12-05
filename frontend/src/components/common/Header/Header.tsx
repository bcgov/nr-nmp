/**
 * @summary Reusable BC Gov Header Component
 */
import { useSSO } from '@bcgov/citz-imb-sso-react';
import logo from '/logo-banner.svg';

import { HeaderWrapper, Heading, Banner, Image, StyledLink } from './header.styles';
import { Button } from '../Button/Button';
import { ButtonWrapper } from '../../../views/LandingPage/landingPage.styles';

export default function Header() {
  const { login, logout, isAuthenticated } = useSSO();

  const handleLoginButton = () => {
    if (isAuthenticated) {
      logout(import.meta.env.VITE_BACKEND_URL);
    } else {
      login({
        backendURL: import.meta.env.VITE_BACKEND_URL,
        idpHint: 'idir',
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
            text={isAuthenticated ? 'Logout' : 'Login'}
            aria-label={isAuthenticated ? 'Logout' : 'Login'}
          />
        </ButtonWrapper>
      </Banner>
    </HeaderWrapper>
  );
}
