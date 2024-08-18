'use client'

import { db } from "@/firebase"
import { useUser } from "@clerk/nextjs"
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material"
import { collection, doc, getDoc, setDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DeleteIcon from '@mui/icons-material/Delete'

export default function Flashcards() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [flashcards, setFlashcards] = useState([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [flashcardToDelete, setFlashcardToDelete] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return
      const docRef = doc(collection(db, 'users'), user.id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || []
        setFlashcards(collections)
      } else {
        await setDoc(docRef, { flashcards: [] })
        setFlashcards([])
      }
    }
    getFlashcards()
  }, [user])

  if (!isLoaded || !isSignedIn) {
    return <></>
  }

  const handleCardClick = (id) => {
    router.push(`/flashcard?id=${id}`)
  }

  const handleDelete = async () => {
    if (!flashcardToDelete) return

    try {
      const docRef = doc(collection(db, 'users'), user.id)
      const userDocSnap = await getDoc(docRef)
      const updatedSets = (userDocSnap.data().flashcards || []).filter(f => f.name !== flashcardToDelete.name)
      await setDoc(docRef, { flashcards: updatedSets })

      setFlashcards(updatedSets)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting flashcard set:", error)
      alert("An error occurred while deleting the flashcard set.")
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 4,
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          sx={{
            backgroundColor: "#3f51b5",
            ":hover": { backgroundColor: "#2c3e9d" },
            color: "#fff",
          }}
          onClick={() => router.push("/")}
        >
          Home
        </Button>
        <Button
          variant="contained"
          color="secondary"
          sx={{
            backgroundColor: "#3f51b5",
            ":hover": { backgroundColor: "#2c3e9d" },
            color: "#fff",
          }}
          onClick={() => router.push("/generate")}
        >
          Generate
        </Button>
      </Box>

      <Box
        sx={{
          backgroundColor: '#fff',
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Grid container spacing={3}>
          {flashcards.length > 0 ? (
            flashcards.map((flashcard, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                  },
                }}>
                  <CardActionArea
                    onClick={() => handleCardClick(flashcard.name)}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                        {flashcard.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <IconButton
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation()
                            setFlashcardToDelete(flashcard)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="h6" align="center" sx={{ color: '#888' }}>
                No flashcards available
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#3f51b5', color: '#fff' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the flashcard set "{flashcardToDelete?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#3f51b5' }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" sx={{ bgcolor: '#FFFFFF', '&:hover': { bgcolor: '#c62828' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
