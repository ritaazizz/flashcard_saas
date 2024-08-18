import { SignIn } from "@clerk/nextjs";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import Link from "next/link";

export default function SignInPage() {
    return (
        <Container maxWidth="sm">
            <AppBar position="static" sx={{ backgroundColor: '#3f51b5' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Flashcard SaaS
                    </Typography>
                    <Button sx={{ color: 'white' }}>
                        <Link href='/sign-in' passHref>
                            <Typography sx={{ color: 'white', textDecoration: 'none' }}>Login</Typography>
                        </Link>
                    </Button>
                    <Button sx={{ color: 'white' }}>
                        <Link href='/sign-up' passHref>
                            <Typography sx={{ color: 'white', textDecoration: 'none' }}>Signup</Typography>
                        </Link>
                    </Button>
                </Toolbar>
            </AppBar>

            <Box 
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
                justifyContent={"center"}
            >
                <Typography variant="h6">Sign In</Typography>
                <SignIn/>
            </Box>
        </Container>
    )
}
