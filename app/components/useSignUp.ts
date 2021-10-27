import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import niceware from 'niceware';

import useGun from 'components/useGun';
import { GUN_PATH, GUN_KEY, GUN_VALUE } from 'utils/constants';

// states:
//  [empty] -> usernameAvailable
//  [empty] -> usernameTaken
//  usernameTaken -> usernameAvailable
//   usernameAvailable -> userCreated
//   usernameAvailable -> userCreateFailed
//   userCreateFailed -> userCreated
//    userCreated -> userAuthed
//    userCreated -> userAuthFailed
//    userAuthFailed -> userAuthed
//     userAuthed -> gotCreds
//     userAuthed -> getCredsFailed
//     getCredsFailed -> gotCreds
//     gotCreds -> userVouched
const STATE = {
  empty: '[empty]',
  usernameAvailable: 'usernameAvailable',
  usernameTaken: 'usernameTaken',
  userCreateFailed: 'userCreateFailed',
  userCreated: 'userCreated',
  userAuthFailed: 'userAuthFailed',
  userAuthed: 'userAuthed',
  gotCreds: 'gotCreds',
  getCredsFailed: 'getCredsFailed',
  userVouched: 'userVouched',
};
export default function useSignUp({
  invitedByUsername,
  onDone: onDoneCallback,
}: {
  invitedByUsername: string;
  onDone?: Function;
}) {
  const router = useRouter();
  const {
    getGun,
    getUser,
    setCertificate,
    getCertificate,
    setAccessToken,
    logout,
  } = useGun();
  const userPubKeyRef = useRef<string>();
  const joinStateRef = useRef<string>(STATE.empty);
  const [value, setValue] = useState<any>({
    username: '',
    invitedBy: invitedByUsername || 'admin',
  });

  const [generatedPassphrase, setGeneratedPassphrase] = useState<string>('');
  const [downloadHref, setDownloadHref] = useState<string>();
  const [signUpError, setSignUpError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>();

  useEffect(() => {
    const passphrase = niceware.generatePassphrase(10).join(' ');
    const file = new Blob([passphrase], { type: 'text/plain' });

    setGeneratedPassphrase(passphrase);
    setDownloadHref(window.URL.createObjectURL(file));
  }, []);

  const onDone = async () => {
    // start session on server
    await axios.post('/api/auth/login', {
      username: value.username,
      pub: userPubKeyRef.current,
    });

    if (onDoneCallback) {
      onDoneCallback();
    } else {
      router.push('/network/me');
    }
  };

  const checkUsername = (onSuccess?: any, onFailure?: any) => {
    setSignUpError('');

    if (value.username.startsWith('admin')) {
      joinStateRef.current = STATE.usernameTaken;

      setSignUpError('That username is not available, try another');

      return;
    }

    // TODO look up from back up user database
    getGun()!
      .get(`~@${value.username}`)
      .once((data) => {
        if (data) {
          if (data.err) console.error(data.err);

          joinStateRef.current = STATE.usernameTaken;

          setSignUpError('That username is not available, try another');

          if (onFailure) onFailure();
        } else {
          joinStateRef.current = STATE.usernameAvailable;

          if (onSuccess) {
            onSuccess();
          } else {
            createUser();
          }
        }
      });
  };

  const createUser = () => {
    getGun()!
      .user()
      .create(value.username, generatedPassphrase, ({ err, pub }: any) => {
        if (err) {
          console.error(err);

          joinStateRef.current = STATE.userCreateFailed;

          setSignUpError('Something went wrong, try again');
        } else {
          userPubKeyRef.current = pub;
          joinStateRef.current = STATE.userCreated;

          authUser();
        }
      });
  };

  const authUser = () => {
    getGun()!
      .user()
      .auth(value.username, generatedPassphrase, ({ err }: any) => {
        if (err) {
          console.error(err);

          joinStateRef.current = STATE.userAuthFailed;
          setSignUpError('Something went wrong, try again');
        } else {
          joinStateRef.current = STATE.userAuthed;
          getCreds();
        }
      });
  };

  const getCreds = async () => {
    try {
      const [certData, tokenData] = await Promise.all([
        axios
          .post(`/api/private/certificates`, {
            username: value.username,
            pub: userPubKeyRef.current,
          })
          .then(({ data }) => data),
        axios
          .post(`/api/private/tokens`, {
            username: value.username,
            pub: userPubKeyRef.current,
          })
          .then(({ data }) => data),
      ]);

      // TODO handle expires at
      // console.log(certData);
      setCertificate(certData.certificate);
      setAccessToken(tokenData.accessToken);

      joinStateRef.current = STATE.gotCreds;
      vouchUser();
    } catch (err) {
      console.error(err);

      setSignUpError('Something went wrong, try again');
    }
  };

  const vouchUser = () => {
    const certOpts = {
      opt: {
        cert: getCertificate(),
      },
    };

    // TODO FIXME can't save to app space?
    // getGun()
    //   .get(`~${NEXT_PUBLIC_GUN_APP_PUBLIC_KEY}`)
    getUser()!
      .get(GUN_PATH.vouches)
      // .get(userPubKeyRef.current)
      .set(
        {
          [value.username]: {
            [GUN_KEY.timestamp]: Date.now(),
            [GUN_KEY.vouchType]: GUN_VALUE.vouched,
            [GUN_KEY.byUsername]: value.invitedBy,
          },
        },
        ({ err }) => {
          if (err) {
            console.error(err);
          }

          joinStateRef.current = STATE.userVouched;

          // finish regardless of failure
          onDone();
        }
      );
  };

  const handleSubmit = async () => {
    console.debug(joinStateRef.current);

    setIsSubmitting(true);
    setSignUpError('');

    switch (joinStateRef.current) {
      case STATE.empty:
      case STATE.usernameTaken:
        await logout();
        checkUsername();
        break;
      case STATE.usernameAvailable:
      case STATE.userCreateFailed:
        await logout();
        createUser();
        break;
      case STATE.userCreated:
      case STATE.userAuthFailed:
        await logout();
        authUser();
        break;
      case STATE.userAuthed:
      case STATE.getCredsFailed:
        getCreds();
        break;
      case STATE.gotCreds:
        vouchUser();
        break;
      case STATE.userVouched:
        onDone();
        break;
      default:
        break;
    }
  };

  return {
    value,
    setValue,
    handleSubmit,
    checkUsername,
    generatedPassphrase,
    downloadHref,
    signUpError,
    isSubmitting,
  };
}
