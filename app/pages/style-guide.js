import * as G from 'grommet';
import Image from 'next/image';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';

import PublicLayout from 'components/PublicLayout';
import vLogoFillOlive from 'public/images/v-logo-fill-olive.svg';
import vLogoFill from 'public/images/v-logo-fill.svg';
import vLogoOutline from 'public/images/v-logo-outline.svg';
import vouchAngencyLogo from 'public/images/vouch-agency-logo.svg';
import vouchLogoOlive from 'public/images/vouch-logo-olive.svg';
import vouchLogo from 'public/images/vouch-logo.svg';

const anchors = [
  {
    label: '(All)',
    tag: 'top',
  },
  {
    label: 'Branding',
    tag: 'branding',
  },
  {
    label: 'Colors',
    tag: 'colors',
  },
  {
    label: 'Text',
    tag: 'text',
  },
  {
    label: 'Forms',
    tag: 'forms',
  },
  // {
  //   label: 'Images',
  //   tag: 'images',
  // },
];

const ScrollToTop = () => (
  <G.Box margin={{ top: 'large' }}>
    <G.Anchor href={`/style-guide#top`} label="^ top" />
  </G.Box>
);

export default function StyleGuide() {
  return (
    <G.Grid
      rows={['auto', '1fr`']}
      columns={['small', '1fr']}
      gap="medium"
      areas={[
        { name: 'header', start: [0, 0], end: [1, 0] },
        { name: 'nav', start: [0, 1], end: [0, 1] },
        { name: 'main', start: [1, 1], end: [1, 1] },
      ]}
    >
      <G.Box gridArea="header" pad="small" margin={{ top: 'large' }}>
        <G.Heading size="small" margin="none">
          Style guide
        </G.Heading>
      </G.Box>

      <G.Box gridArea="nav" background="light-1" pad="medium" round="small">
        <G.Nav>
          {anchors.map(({ tag, label }) => (
            <G.Anchor key={label} href={`/style-guide#${tag}`} label={label} />
          ))}
        </G.Nav>
      </G.Box>

      <G.Box id="top" gridArea="main">
        <G.Box id="branding" pad="medium">
          <G.Box>
            <G.Heading level={2} color="neutral-2" margin={{ top: 'none' }}>
              Branding
            </G.Heading>
            <G.Box gap="medium">
              <G.Box direction="row" gap="large">
                <G.Box width="15rem" height="6rem">
                  <Image src={vouchAngencyLogo} />
                </G.Box>
                <G.Box width="15rem" height="6rem">
                  <Image src={vouchLogoOlive} />
                </G.Box>
                <G.Box width="15rem" height="6rem">
                  <Image src={vouchLogo} />
                </G.Box>
              </G.Box>
              <G.Box direction="row" gap="large">
                <G.Box width="xsmall" height="xsmall">
                  <Image src={vLogoOutline} />
                </G.Box>
                <G.Box width="xsmall" height="xsmall">
                  <Image src={vLogoFillOlive} />
                </G.Box>
                <G.Box width="xsmall" height="xsmall">
                  <Image src={vLogoFill} />
                </G.Box>
                <G.Box width="xxsmall" height="xxsmall">
                  <Image src={vLogoOutline} />
                </G.Box>
                <G.Box width="xxsmall" height="xxsmall">
                  <Image src={vLogoFillOlive} />
                </G.Box>
                <G.Box width="xxsmall" height="xxsmall">
                  <Image src={vLogoFill} />
                </G.Box>
              </G.Box>
            </G.Box>
            <ScrollToTop />
          </G.Box>
        </G.Box>

        <G.Box id="colors" pad="medium">
          <G.Heading level={2} color="neutral-2">
            Colors
          </G.Heading>
          <G.Text weight="bold" size="medium">
            brand
          </G.Text>
          <G.Box
            direction="row"
            wrap
            margin={{ top: 'xsmall', bottom: 'medium' }}
          >
            <G.Box
              width="small"
              height="xsmall"
              background="brand"
              round="small"
            />
          </G.Box>
          <G.Text weight="bold" size="medium">
            accent-*
          </G.Text>
          <G.Box
            direction="row"
            wrap
            margin={{ top: 'xsmall', bottom: 'medium' }}
          >
            <G.Box
              width="small"
              height="xsmall"
              background="accent-1"
              round={{ size: 'small', corner: 'left' }}
            />
            <G.Box width="small" height="xsmall" background="accent-2" />
            <G.Box width="small" height="xsmall" background="accent-3" />
            <G.Box
              width="small"
              height="xsmall"
              background="accent-4"
              round={{ size: 'small', corner: 'right' }}
            />
          </G.Box>
          <G.Text weight="bold" size="medium">
            neutral-*
          </G.Text>
          <G.Box
            direction="row"
            wrap
            margin={{ top: 'xsmall', bottom: 'medium' }}
          >
            <G.Box
              width="small"
              height="xsmall"
              background="neutral-1"
              round={{ size: 'small', corner: 'left' }}
            />
            <G.Box width="small" height="xsmall" background="neutral-2" />
            <G.Box width="small" height="xsmall" background="neutral-3" />
            <G.Box
              width="small"
              height="xsmall"
              background="neutral-4"
              round={{ size: 'small', corner: 'right' }}
            />
          </G.Box>
          <G.Text weight="bold" size="medium">
            status-*
          </G.Text>
          <G.Box
            direction="row"
            wrap
            margin={{ top: 'xsmall', bottom: 'medium' }}
          >
            <G.Box
              width="small"
              height="xsmall"
              background="status-error"
              round={{ size: 'small', corner: 'left' }}
            />
            <G.Box width="small" height="xsmall" background="status-warning" />
            <G.Box width="small" height="xsmall" background="status-ok" />
            <G.Box
              width="small"
              height="xsmall"
              background="status-disabled"
              round={{ size: 'small', corner: 'right' }}
            />
          </G.Box>

          <G.Text weight="bold" size="medium">
            light-*
          </G.Text>
          <G.Box
            direction="row"
            wrap
            margin={{ top: 'xsmall', bottom: 'medium' }}
          >
            <G.Box
              width="small"
              height="xsmall"
              background="light-1"
              round={{ size: 'small', corner: 'left' }}
            />
            <G.Box width="small" height="xsmall" background="light-2" />
            <G.Box width="small" height="xsmall" background="light-3" />
            <G.Box
              width="small"
              height="xsmall"
              background="light-4"
              round={{ size: 'small', corner: 'right' }}
            />
          </G.Box>

          <G.Text weight="bold" size="medium">
            dark-*
          </G.Text>
          <G.Box
            direction="row"
            wrap
            margin={{ top: 'xsmall', bottom: 'medium' }}
          >
            <G.Box
              width="small"
              height="xsmall"
              background="dark-1"
              round={{ size: 'small', corner: 'left' }}
            />
            <G.Box width="small" height="xsmall" background="dark-2" />
            <G.Box width="small" height="xsmall" background="dark-3" />
            <G.Box
              width="small"
              height="xsmall"
              background="dark-4"
              round={{ size: 'small', corner: 'right' }}
            />
          </G.Box>
          <G.Box>
            <ScrollToTop />
          </G.Box>
        </G.Box>

        <G.Box id="text" pad="medium">
          <G.Heading level={2} color="neutral-2">
            Text
          </G.Heading>
          <G.Heading level={1}>Gr.Heading 1</G.Heading>
          <G.Text size="large">
            Nunc hendrerit auctor <G.Anchor href="#">mi a sagittis</G.Anchor>.
            Aenean blandit.
          </G.Text>
          <G.Heading level={2}>Gr.Heading 2</G.Heading>
          <G.Text size="medium">
            Nunc hendrerit auctor mi a sagittis. Aenean blandit.
          </G.Text>
          <G.Heading level={3}>Gr.Heading 3</G.Heading>
          <G.Text size="small">
            Nunc hendrerit auctor mi a sagittis. Aenean blandit.
          </G.Text>
          <G.Heading level={4}>Gr.Heading 4</G.Heading>
          <G.Paragraph textAlign="center">
            Sed molestie rutrum diam nec condimentum. Suspendisse in odio eu est
            vehicula tempor a et odio. Praesent rhoncus lectus at.
          </G.Paragraph>
          <G.Heading level={5}>Gr.Heading 5</G.Heading>
          <G.Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
            ac euismod elit. Cras mattis laoreet mi, a faucibus nulla facilisis
            quis. Integer lorem turpis, vulputate vel nunc sed, rutrum accumsan
            orci. Fusce scelerisque ut tortor id tempor. Aenean volutpat nulla
            magna. Vivamus ut dui pretium, semper eros posuere, faucibus sapien.
            Curabitur arcu tellus, blandit id sagittis sit amet, pellentesque
            tincidunt augue. Maecenas suscipit, sem ut vehicula molestie, ex
            sapien laoreet est, at sodales enim erat at libero. Aenean ante
            nulla, scelerisque sed quam eget, ornare lobortis mauris. Sed eget
            maximus purus, faucibus fringilla nulla.
          </G.Paragraph>
          <G.Box>
            <ScrollToTop />
          </G.Box>
        </G.Box>

        <G.Box id="forms" pad="medium">
          <G.Heading level={2} color="neutral-2">
            Forms
          </G.Heading>

          <G.Box direction="row" gap="large">
            <G.Box width="medium">
              <G.Heading level={3} size="small">
                Simple form
              </G.Heading>
              <G.Box>
                <G.Form onSubmit={({ value }) => {}}>
                  <G.FormField
                    name="email"
                    htmlFor="textinput-email"
                    label="Email"
                  >
                    <G.TextInput
                      id="textinput-email"
                      name="email"
                      placeholder="you@example.me"
                    />
                  </G.FormField>
                  <G.Box direction="row" gap="small" justify="end">
                    <G.Button type="submit" primary label="Submit" />
                    <G.Button type="reset" label="Reset" />
                  </G.Box>
                </G.Form>
              </G.Box>
              <G.Box>
                <G.Heading level={3} size="small">
                  Buttons
                </G.Heading>
                <G.Box
                  direction="row"
                  gap="small"
                  align="center"
                  justify="center"
                >
                  <G.Button label="Edit" size="small" primary />
                  <G.Button label="Save changes" size="medium" primary />
                  <G.Button label="Log in" size="large" primary />
                </G.Box>
              </G.Box>
            </G.Box>
            <G.Box width="medium">
              <G.Heading level={3} size="small">
                Form fields
              </G.Heading>
              <G.Box>
                <G.FormField name="name" label="Name" help="Your full name">
                  <G.TextInput
                    id="textinput-name"
                    name="name"
                    aria-valuemin="Minnie Mouse"
                  />
                </G.FormField>
                <G.FormField label="ID" info="readonly" disabled>
                  <G.TextInput value="abc123" readOnly />
                </G.FormField>
                <G.FormField label="World size">
                  <G.Select
                    options={['small', 'medium', 'large']}
                    value="large"
                  />
                </G.FormField>
                <G.FormField label="Options">
                  <G.CheckBox checked label="This?" />
                </G.FormField>
                <G.FormField label="A picture">
                  <G.FileInput
                    name="file"
                    onChange={(event) => {
                      const fileList = event.target.files;
                      for (let i = 0; i < fileList.length; i += 1) {
                        const file = fileList[i];
                      }
                    }}
                  />
                </G.FormField>
              </G.Box>
            </G.Box>
          </G.Box>

          <G.Box>
            <ScrollToTop />
          </G.Box>
        </G.Box>

        {/* <G.Box id="tag" pad="medium">
          <G.Box>
            <G.Heading level={2} color="neutral-2">
              Label
            </G.Heading>
            <G.Box>content</G.Box>
            <ScrollToTop />
          </G.Box>
        </G.Box> */}
      </G.Box>
    </G.Grid>
  );
}

StyleGuide.getLayout = function getLayout(page) {
  return <PublicLayout>{page}</PublicLayout>;
};

export const getServerSideProps = withPageAuthRequired();
