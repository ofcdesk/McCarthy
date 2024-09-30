import { Button, Card, Box, styled } from "@mui/material";
import { H1, H6 } from "components/Typography";
import BazaarImage from "components/BazaarImage";
import { useRouter } from "next/router";

const fbStyle = {
  background: "#3B5998",
  color: "white",
};
const googleStyle = {
  background: "#4285F4",
  color: "white",
};
export const Wrapper = styled(({ children, passwordVisibility, ...rest }) => (
  <Card {...rest}>{children}</Card>
))(({ theme, passwordVisibility }) => ({
  width: 500,
  padding: "2rem 3rem",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
  ".passwordEye": {
    color: passwordVisibility
      ? theme.palette.grey[600]
      : theme.palette.grey[400],
  },
  ".facebookButton": {
    marginBottom: 10,
    ...fbStyle,
    "&:hover": fbStyle,
  },
  ".googleButton": { ...googleStyle, "&:hover": googleStyle },
  ".agreement": {
    marginTop: 12,
    marginBottom: 24,
  },
}));

const Login = () => {
  const router = useRouter();

  return (
    <Wrapper elevation={3}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/api/acc_login");
        }}
      >
        <BazaarImage
          height={44}
          src="/assets/images/logo2.png"
          sx={{
            m: "auto",
          }}
        />

        <H1 textAlign="center" mt={1} mb={4} fontSize={16}>
          McCarthy Dashboard
        </H1>

        <Button
          fullWidth
          type="submit"
          color="secondary"
          variant="contained"
          sx={{
            height: 44,
          }}
        >
          Login
        </Button>
      </form>
    </Wrapper>
  );
};

export default Login;
