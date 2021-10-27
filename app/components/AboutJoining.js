import { Anchor, Heading, Paragraph } from 'grommet';

export default function AboutJoining() {
  return (
    <>
      <Heading size="small" margin="none">
        <em>What does it mean to join?</em>
      </Heading>
      <Paragraph size="xlarge">
        You are joining a peer-to-peer network.
      </Paragraph>
      <Paragraph size="large" margin={{ top: 'none' }}>
        By being a Vouch Network member, you agree to peer with other Network
        members to collectively provide one another with the greatest level of
        privacy possible on the open web.
      </Paragraph>
      <Paragraph size="large" margin={{ top: 'none' }}>
        Peer in this sense has two definitions:
      </Paragraph>
      <Paragraph size="large" margin={{ top: 'none' }}>
        <strong>1. Your capacity to act as an equal among all members.</strong>
        <br />
        <br />
        There are no admins, agents, or moderators. By joining, you agree to
        participate in vouching, moderating, facilitating, growing and generally
        contributing to the interpersonal health of the network.
      </Paragraph>
      <Paragraph size="large" margin={{ top: 'none' }}>
        <strong>
          2. Peer-to-peer (P2P) technology used to decentralize control of data.
        </strong>
        <br />
        <br />
        Peering is a technical feature of the Vouch Network in reference to P2P
        technology. (See{' '}
        <Anchor
          href="https://en.wikipedia.org/wiki/Peer-to-peer"
          target="_blank"
        >
          Peer-to-peer, Wikipedia
        </Anchor>
        ) By agreeing to peer, you are agreeing to contribute some amount of
        storage space in your browser and some amount of network bandwidth to
        the Vouch Network while you are logged in.
      </Paragraph>
      <Paragraph size="large" margin={{ top: 'none' }}>
        This should have no discernible impact on your experience browsing the
        web. In fact, many if not most websites you visit will insert data into
        your browser storage, and use your bandwith to send data to external
        websites, for the benefit of their company and advertisers.
      </Paragraph>
      <Paragraph size="large" margin={{ top: 'none' }}>
        The developer of this app does not store, have access to or is able to
        modify your data. This is unlike many if not most apps where the
        application developer or admin can control, censor or otherwise modify
        data.
      </Paragraph>
      <Paragraph size="xlarge">
        The network only exists through active participation.
      </Paragraph>
      <Paragraph size="large" margin={{ top: 'none' }}>
        Trust is built into Vouch Network. Members are asked to vouch for those
        they professionally, creatively or personally trust. Each person you
        invite will be noted as vouched for by you.
      </Paragraph>
      <Paragraph size="large" margin={{ top: 'none' }}>
        Vouching may feel similar to "liking" or "following" someone on the
        surface. However, your previous link to a person is erased upon
        unfollowing them.{' '}
        <em>
          The history of a member's vouches and unvouches is public and
          immutable.
        </em>{' '}
        You have the ability to "unvouch" for a person if necessary; their
        history of being vouched for and unvouched will remain a permanent
        public record. The transparency of the vouching system removes the need
        for moderators because it is self-moderating.
      </Paragraph>
    </>
  );
}
