import axios, { CancelTokenSource } from 'axios';
import { useEffect, useState, useRef } from 'react';

import useAuth from 'components/useAuth';
import useApiToken from 'components/useApiToken';

type FormValue = {
  username: string;
  email: string;
};

interface UseSignUp {
  value: FormValue;
  onChange: (nextValue: FormValue) => void;
  onUsernameBlur: () => void;
  handleSubmit: () => Promise<void>;
  sendSignupEmail: () => Promise<void>;
  usernameError: string | undefined;
  signUpError: string | undefined;
  isCheckingUsername: boolean;
  isSubmitting: boolean;
}

export default function useSignUp({
  invitedById,
  signupToken,
}: {
  invitedById?: string;
  signupToken?: string;
} = {}): UseSignUp {
  const { getTokenHeader } = useApiToken();
  const { login } = useAuth();
  const verifiedUsernameRef = useRef<FormValue['username'] | null>();
  const checkUsernameCancelTokenRef = useRef<CancelTokenSource>();
  const [value, setValue] = useState<FormValue>({
    username: '',
    email: '',
  });

  const [usernameError, setUsernameError] = useState<string>();
  const [signUpError, setSignUpError] = useState<string>();
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const checkUsername = async () => {
    verifiedUsernameRef.current = null;

    setUsernameError('');
    setIsCheckingUsername(true);

    const handleFailure = () => {
      setUsernameError('That username is not available, try something else.');
    };

    if (checkUsernameCancelTokenRef.current) {
      checkUsernameCancelTokenRef.current.cancel();
    }

    checkUsernameCancelTokenRef.current = axios.CancelToken.source();

    try {
      const { data } = await axios.get(
        `/api/agency/profiles/${value.username}`,
        {
          cancelToken: checkUsernameCancelTokenRef.current.token,
        }
      );

      if (data.profile) {
        handleFailure();
      } else {
        verifiedUsernameRef.current = value.username;
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error(err);

        handleFailure();
      }
    }

    setIsCheckingUsername(false);
  };

  const sendSignupEmail = async () => {
    setIsSubmitting(true);
    setSignUpError('');

    try {
      login(
        { email: value.email },
        {
          username: value.username,
          isNewUser: true,
          signupToken,
        }
      );

      setIsSubmitting(false);
    } catch (err) {
      console.error(err);

      setIsSubmitting(false);

      setSignUpError("Couldn't get you signed up. Try signing up again.");
    }
  };

  const handleSubmit: UseSignUp['handleSubmit'] = async () => {
    setIsSubmitting(true);
    setSignUpError('');

    try {
      if (!verifiedUsernameRef.current) {
        await checkUsername();
      }

      if (verifiedUsernameRef.current === value.username) {
        await axios.post(
          '/api/network/emails/alias',
          {
            username: verifiedUsernameRef.current,
          },
          {
            headers: await getTokenHeader(),
          }
        );
      } else {
        setUsernameError('That username is not available, try something else.');
      }
    } catch {}

    setIsSubmitting(false);
  };

  const onChange = ({ username, ...otherValues }: FormValue) => {
    if (username) {
      // replace spaces
      const formattedUsername = username.replace(/\s/g, '-');

      if (/^[\w.-]+$/gi.test(formattedUsername)) {
        if (/^[a-z]/i.test(formattedUsername)) {
          const specialChars = ['-', '_', '.'];

          const hasConsecutiveError = specialChars.some((x) => {
            if (username.includes(x)) {
              return specialChars.some((y) => {
                if (username.includes(`${x}${y}`)) {
                  return true;
                }

                return false;
              });
            }

            return false;
          });

          if (hasConsecutiveError) {
            setUsernameError(
              `You can't use consecutive hyphens, underscores or periods.`
            );
          }
        } else {
          setUsernameError(`Your username must start with a letter.`);
        }
      } else {
        setUsernameError(
          `Your username can only contain letters (a-z), numbers (0-9), hyphens (-), underscores (_) and periods (.)`
        );
      }

      setValue({ username: formattedUsername, ...otherValues });
    } else {
      setValue({ username, ...otherValues });
    }
  };

  const onUsernameBlur = () => {
    const { username } = value;

    if (username) {
      if (/[a-z0-9]$/i.test(username)) {
        if (/\badmin|vouch|help|support|info\b/.test(username)) {
          setUsernameError('1 t available, try something else.');
        } else {
          checkUsername();
        }
      } else {
        setUsernameError(`Your username must end with a letter or number.`);
      }
    } else {
      setUsernameError(`A username is required.`);
    }
  };

  return {
    value,
    onChange,
    onUsernameBlur,
    handleSubmit,
    sendSignupEmail,
    usernameError,
    signUpError,
    isCheckingUsername,
    isSubmitting,
  };
}
