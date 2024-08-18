'use client'

import { Box, CircularProgress, Container, Typography } from "@mui/material"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"


const ResultPage = () => {
    const rotuer = useRouter()
    const searchParams = useSearchParams()
    const session_id = searchParams.get('session_id')

    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchCheckcoutSession = async () => {
            if (!session_id) return

            try {
                const res = await fetch(`/api/checkout_session?session_id=${session_id}`)
                const sessionData = await res.json()
                if (res.ok) {
                    setSession(sessionData)
                } else {
                    setError(sessionData.error)
                }
            } catch (e) {
                console.error('An error occured')
            }
            finally {
                setLoading(false)
            }
        }

        fetchCheckcoutSession()
    }, [session_id])


    if (loading) {
        return (
            <Container maxWidth="100vw" sx={{
                textAlign: 'center',
                mt: 4,
            }}>
                <CircularProgress />
                <Typography variant="h6">Loading...</Typography>
            </Container>
        )
    }

    if (error) {
        console.log(error);
        
        return (
            <Container maxWidth="100vw" sx={{
                textAlign: 'center',
                mt: 4,
            }}>
                <CircularProgress />
                <Typography variant="h6">{error}</Typography>
            </Container>
        )
    }

    
    

    return (
        <Container maxWidth="100vw" sx={{
            textAlign: 'center',
            mt: 4,
        }}>
            {
                session.payment_status === "paid"
                ? (<>
                    <Typography variant="h4">Thank you for purchasing</Typography>
                    <Box sx={{ mt: 22 }}>
                        <Typography variant="h6">Session Id: {session_id}</Typography>
                        <Typography variant="body1">
                            We have recieved your payment. You will recieve an email with the order details shortly.
                        </Typography>
                    </Box>
                </> 
                )
                : (
                    <>
                        <Typography variant="h4">Payment failed</Typography>
                        <Box sx={{ mt: 22 }}>
                        <Typography variant="body1">
                            Please try again.
                        </Typography>
                    </Box>
                    </>
                )
            }
        </Container>
    )
}

export default ResultPage