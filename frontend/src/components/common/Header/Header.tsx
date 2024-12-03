/**
 * @summary Reusable BC Gov Header Component
 */
import logo from '/logo-banner.svg';

import { HeaderWrapper, Heading, Banner, Image, StyledLink } from './header.styles';

export default function Header() {
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
      </Banner>
    </HeaderWrapper>
  );
}
