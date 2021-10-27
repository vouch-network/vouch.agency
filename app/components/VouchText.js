import { Text, Paragraph } from 'grommet';

import vouchText from 'data/vouchText';

export default function VouchText() {
  return (
    <>
      {vouchText.map((t, i) => (
        <Paragraph key={i} size="small" color="brand">
          <Text weight="bold" size="small">
            {t.heading}
          </Text>
          <br />
          {t.body}
        </Paragraph>
      ))}
    </>
  );
}
