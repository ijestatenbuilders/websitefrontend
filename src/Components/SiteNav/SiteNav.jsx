import { useNavigate } from 'react-router-dom';
import ExperienceNav, { MapIcon, AiraIcon } from '../Experience/ExperienceNav';
import { airaStore } from '../../utils/airaStore';

// Site-wide links. `id` links scroll to in-page sections on the home page
// (ExperienceNav navigates home + scrolls when the section isn't on the current
// page); `to` links are full routes.
const SITE_LINKS = [
  { id: 'hero', label: 'Home' },
  { id: 'properties', label: 'Properties' },
  { id: 'new', label: 'New Projects' },
  { to: '/virtual-3d', label: 'Virtual 3D', external: true },
  { to: '/forums', label: 'Forums', external: true },
  { to: '/about', label: 'About Us', external: true },
  { to: '/contact', label: 'Contact Us', external: true },
];

/**
 * SiteNav — the single navbar used across the whole site. Wraps ExperienceNav
 * with the standard links + Map / Aira AI actions so every page shares one bar.
 */
export default function SiteNav() {
  const navigate = useNavigate();
  return (
    <ExperienceNav
      links={SITE_LINKS}
      secondary={{ label: 'Map', icon: <MapIcon />, onClick: () => navigate('/map') }}
      primary={{ label: 'Aira AI', icon: <AiraIcon />, onClick: () => airaStore.open() }}
    />
  );
}
