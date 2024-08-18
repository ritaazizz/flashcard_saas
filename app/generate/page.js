'use client';

import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { collection, getDoc, writeBatch, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState("");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    fetch("/api/generate", {
      method: "POST",
      body: text,
    })
      .then((res) => res.json())
      .then((data) => setFlashcards(data));
  };

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveFlashcards = async () => {
    if (!name) {
      alert("Please enter a name for your flashcard set.");
      return;
    }

    if (!isLoaded || !isSignedIn || !user) {
      alert("User is not signed in. Please sign in to save your flashcards.");
      return;
    }

    try {
      const batch = writeBatch(db);
      const userDocRef = doc(collection(db, "users"), user.id);
      const userDocSnap = await getDoc(userDocRef);

      const existingSetRef = doc(collection(userDocRef, "flashcardSets"), name);
      const existingSetSnap = await getDoc(existingSetRef);
      if (existingSetSnap.exists()) {
        alert("A flashcard set with this name already exists. Please choose a different name.");
        return;
      }

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const updatedSets = [...(userData.flashcards || []), { name }];
        batch.update(userDocRef, { flashcards: updatedSets });
      } else {
        batch.set(userDocRef, { flashcards: [{ name }] });
      }

      const chunkSize = 400;
      for (let i = 0; i < flashcards.length; i += chunkSize) {
        const chunk = flashcards.slice(i, i + chunkSize);
        const chunkBatch = writeBatch(db);

        chunk.forEach((flashcard) => {
          const cardDocRef = doc(collection(existingSetRef, "cards"));
          chunkBatch.set(cardDocRef, flashcard);
        });

        await chunkBatch.commit();
      }

      await batch.commit();

      alert("Flashcards saved successfully!");
      handleClose();
      setName("");
    } catch (error) {
      console.error("Error saving flashcards:", error);
      alert(`An error occurred while saving flashcards: ${error.message}`);
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        bgcolor: "#f0f4f8", // Background color matching dashboard
        color: "#333",
        minHeight: "100vh",
        py: 4,
        borderRadius: 3,
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          sx={{
            backgroundColor: "#3f51b5", // Primary color from dashboard
            ":hover": { backgroundColor: "#2c3e9d" }, // Darker shade for hover effect
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
            backgroundColor: "#3f51b5", // Primary color from dashboard
            ":hover": { backgroundColor: "#2c3e9d" }, // Darker shade for hover effect
            color: "#fff",
          }}
          onClick={() => router.push("/flashcards")}
        >
          Flashcards
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 6,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            color: "#3f51b5", // Heading color matching primary
            fontWeight: "bold",
            letterSpacing: 1.2,
          }}
        >
          Generate Flashcards
        </Typography>
        <Paper
          sx={{
            p: 4,
            width: "100%",
            bgcolor: "#ffffff",
            borderRadius: 2,
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            label="Enter text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              backgroundColor: "#3f51b5", // Primary color from dashboard
              ":hover": { backgroundColor: "#2c3e9d" }, // Darker shade for hover effect
              color: "#fff",
              borderRadius: 2,
            }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Paper>
      </Box>

      {flashcards.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              color: "#333",
              fontWeight: "medium",
              letterSpacing: 1,
            }}
          >
            Flashcards Preview
          </Typography>
          <Grid container spacing={3}>
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    bgcolor: "#ffffff",
                    borderRadius: 2,
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <CardActionArea onClick={() => handleCardClick(index)}>
                    <CardContent>
                      <Box
                        sx={{
                          perspective: "1000px",
                          "& > div": {
                            transition: "transform 0.6s",
                            transformStyle: "preserve-3d",
                            position: "relative",
                            width: "100%",
                            height: "200px",
                            boxShadow: 1,
                            borderRadius: 2,
                            transform: flipped[index]
                              ? "rotateY(180deg)"
                              : "rotateY(0deg)",
                          },
                          "& > div > div": {
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backfaceVisibility: "hidden",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: 2,
                            boxSizing: "border-box",
                            borderRadius: 2,
                          },
                          "& > div > div:nth-of-type(2)": {
                            transform: "rotateY(180deg)",
                            backgroundColor: "#1976d2", // Card flip color matching primary
                            color: "#fff",
                          },
                        }}
                      >
                        <div>
                          <div>
                            <Typography
                              variant="h6"
                              component="div"
                              sx={{ color: "#333", fontWeight: "medium" }}
                            >
                              {flashcard.front}
                            </Typography>
                          </div>
                          <div>
                            <Typography
                              variant="h6"
                              component="div"
                              sx={{ color: "#fff", fontWeight: "medium" }}
                            >
                              {flashcard.back}
                            </Typography>
                          </div>
                        </div>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              sx={{
                backgroundColor: "#3f51b5", // Primary color from dashboard
                ":hover": { backgroundColor: "#2c3e9d" }, // Darker shade for hover effect
                color: "#fff",
                borderRadius: 2,
              }}
              onClick={handleOpen}
            >
              Save Flashcards
            </Button>
          </Box>
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Save Flashcards</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for your flashcard set.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Flashcard Set Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: "#3f51b5" }}>
            Cancel
          </Button>
          <Button
            onClick={saveFlashcards}
            sx={{
              bgcolor: "#3f51b5",
              color: "#fff",
              ":hover": { bgcolor: "#2c3e9d" },
              borderRadius: 2,
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
