/**
 * @summary Reusable BC Gov Header Component
 */
import { useSSO } from '@bcgov/citz-imb-sso-react';
import logo from '/logo-banner.svg';
// import { Link } from 'react-router-dom';

import { HeaderWrapper, Heading, Banner, Image, StyledLink } from './header.styles';
import { Button } from '../Button/Button';
import { ButtonWrapper } from '../../../views/LandingPage/landingPage.styles';

export default function Header() {
  const { login, logout, isAuthenticated } = useSSO();

  const handleLoginButton = () => {
    if (isAuthenticated) {
      logout();
    } else {
      login({ backendURL: 'http://localhost:3000', idpHint: 'idir', postLoginRedirectURL: '/' });
    }
  };

  return (
    <HeaderWrapper>
      <Banner>
        <Image
          src={logo}
          alt="Go to the Home page"
        />
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
// Will use the link when home page is created.
// export default function Header() {
//     return (
//       <HeaderWrapper>
//         <Banner>
//           <Link to="/">
//             <Image
//               src={logo}
//               alt="Go to the Home page"
//             />
//           </Link>
//           <StyledLink href="/">
//             <Heading>Nutrient Management Calculator</Heading>
//           </StyledLink>
//         </Banner>
//       </HeaderWrapper>
//     );
//   }
