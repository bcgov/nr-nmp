/**
 * @summary Reusable BC Gov Header Component
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppState from '@/hooks/useAppState';
import { LANDING_PAGE } from '@/constants/routes';
import { downloadBlob } from '@/views/Reporting/utils';
import logo from '/logo-banner.svg';

import { HeaderWrapper, Heading, Banner, Image } from './header.styles';
import RedirectDialog from '../RedirectDialog/RedirectDialog';

export default function Header() {
  const { state } = useAppState();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <HeaderWrapper>
      <Banner>
        <Image
          src={logo}
          alt="Go to the Home page"
          onClick={() => {
            if (state.nmpFile.years.length === 0) {
              navigate(LANDING_PAGE);
            } else {
              setIsOpen(true);
            }
          }}
        />
        <Heading onClick={() => {
          if (state.nmpFile.years.length === 0) {
            navigate(LANDING_PAGE);
          } else {
            setIsOpen(true);
          }
        }}
        >
          Nutrient Management Calculator
        </Heading>
      </Banner>
      {isOpen && (
        <RedirectDialog
          isOpen={isOpen}
          onOpenChange={(b) => setIsOpen(b)}
          downloadFile={() => downloadBlob(state.nmpFile)}
        />
      )}
    </HeaderWrapper>
  );
}
