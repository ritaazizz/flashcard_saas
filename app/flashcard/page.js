'use client'

import { db } from "@/firebase"
import { useUser } from "@clerk/nextjs"
import { Box, Button, Card, CardActionArea, CardContent, Container, Grid, Typography } from "@mui/material"
import { collection, doc, getDocs } from "firebase/firestore"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function FlashCard() {
    const { isLoaded, isSignedIn, user } = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState({})
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isStudying, setIsStudying] = useState(false) // State to toggle between views

    const searchParams = useSearchParams()
    const search = searchParams.get('id')
    const router = useRouter() // Hook for navigation

    useEffect(() => {
        async function getFlashcards() {
            if (!search || !user) return;
            try {
                const colRef = collection(doc(collection(db, 'users'), user.id), 'flashcardSets', search, 'cards');
                const docs = await getDocs(colRef);
                const flashcards = [];

                docs.forEach((doc) => {
                    flashcards.push({ id: doc.id, ...doc.data() });
                });

                setFlashcards(flashcards);
                setCurrentIndex(0); // Reset index when flashcards are fetched
            } catch (error) {
                console.error("Error fetching flashcards:", error);
            }
        }
        getFlashcards();
    }, [user, search]);

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    }

    const handleNext = () => {
        setCurrentIndex((prev) => Math.min(prev + 1, flashcards.length - 1));
    }

    const handleBack = () => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }

    const toggleStudyMode = () => {
        setIsStudying((prev) => !prev);
    }

    if (!isLoaded || !isSignedIn || !user) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            {!isStudying && (
                <>
                    <Typography variant="h4" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
                        Flashcards for {search}
                    </Typography>

                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => router.back()} // Navigate back
                            sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
                        >
                            Back
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={toggleStudyMode}
                            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#115293' } }}
                        >
                            Study
                        </Button>
                    </Box>

                    <Grid container spacing={3}>
                        {flashcards.map((flashcard, index) => (
                            <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
                                <Card sx={{ borderRadius: 2, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', transition: '0.3s', '&:hover': { boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)' } }}>
                                    <CardActionArea
                                        onClick={() => handleCardClick(index)}
                                    >
                                        <CardContent>
                                            <Box sx={{
                                                perspective: '1000px',
                                                '& > div': {
                                                    transition: 'transform 0.6s',
                                                    transformStyle: 'preserve-3d',
                                                    position: 'relative',
                                                    width: '100%',
                                                    height: '200px',
                                                    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                                                    borderRadius: 2,
                                                    transform: flipped[index]
                                                        ? 'rotateY(180deg)'
                                                        : 'rotateY(0deg)',
                                                },
                                                '& > div > div': { 
                                                    position: 'absolute',
                                                    width: '100%',
                                                    height: '100%',
                                                    backfaceVisibility: 'hidden',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    padding: 2,
                                                    boxSizing: 'border-box'
                                                },
                                                '& > div > div:nth-of-type(2)': {
                                                    transform: 'rotateY(180deg)',
                                                },
                                            }}>
                                                <div>
                                                    <div>
                                                        <Typography variant="h6" component={'div'} sx={{ textAlign: 'center' }}>{flashcard.front}</Typography>
                                                    </div>
                                                    <div>
                                                        <Typography variant="h6" component={'div'} sx={{ textAlign: 'center' }}>{flashcard.back}</Typography>
                                                    </div>
                                                </div>
                                            </Box>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            {isStudying && (
                <>
                    <Typography variant="h4" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
                        Studying Flashcard for {search}
                    </Typography>

                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={toggleStudyMode}
                        sx={{ mb: 2, bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
                    >
                        Back to Overview
                    </Button>

                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', p: 3 }}>
                        <CardActionArea
                            onClick={() => handleCardClick(currentIndex)}
                        >
                            <CardContent>
                                <Box sx={{
                                    perspective: '1000px',
                                    '& > div': {
                                        transition: 'transform 0.6s',
                                        transformStyle: 'preserve-3d',
                                        position: 'relative',
                                        width: '100%',
                                        height: '400px', // Increased height
                                        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                                        borderRadius: 2,
                                        transform: flipped[currentIndex]
                                            ? 'rotateY(180deg)'
                                            : 'rotateY(0deg)',
                                    },
                                    '& > div > div': { 
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        backfaceVisibility: 'hidden',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: 3,
                                        boxSizing: 'border-box'
                                    },
                                    '& > div > div:nth-of-type(2)': {
                                        transform: 'rotateY(180deg)',
                                    },
                                }}>
                                    <div>
                                        <div>
                                            <Typography variant="h5" component={'div'} sx={{ textAlign: 'center' }}>{flashcards[currentIndex].front}</Typography>
                                        </div>
                                        <div>
                                            <Typography variant="h5" component={'div'} sx={{ textAlign: 'center' }}>{flashcards[currentIndex].back}</Typography>
                                        </div>
                                    </div>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleBack}
                            disabled={currentIndex === 0}
                            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#115293' } }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                            disabled={currentIndex === flashcards.length - 1}
                            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#115293' } }}
                        >
                            Next
                        </Button>
                    </Box>
                </>
            )}
        </Container>
    )
}
