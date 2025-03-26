import { PageTitleStyle } from './pageTitle.style';

export default function PageTitle({ title }: { title: string }) {
  return <PageTitleStyle>{title}</PageTitleStyle>;
}
