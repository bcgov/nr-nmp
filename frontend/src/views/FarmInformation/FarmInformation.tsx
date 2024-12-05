/**
 * @summary The Farm Information page for the application
 */
import { ViewContainer, Card, CardHeader, Banner, Heading } from './farmInformation.styles';

export default function FarmInformation() {
  return (
    <ViewContainer>
      <Card>
        <CardHeader>
          <Banner>
            <Heading>Farm Information</Heading>
          </Banner>
        </CardHeader>
      </Card>
    </ViewContainer>
  );
}
