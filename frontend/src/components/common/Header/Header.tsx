/**
 * @summary Reusable BC Gov Header Component
 */
import logo from '/logo-banner.svg';
// import { Link } from 'react-router-dom';

import { HeaderWrapper, Heading, Banner, Image, StyledLink } from './header.styles';

export default function Header() {
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
