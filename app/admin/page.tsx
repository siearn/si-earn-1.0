"use client"

import { useState } from "react"
import { useUser } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, Video } from "lucide-react"
import UserHeader from "@/components/user-header"
import { redirect } from "next/navigation"

export default function AdminPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("")
  const [reward, setReward] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [videoFile, setVideoFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [questions, setQuestions] = useState([{ question: "", options: ["", "", "", ""] }])
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  if (isLoaded && !isSignedIn) {
    redirect("/login")
  }

  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
    }
  }

  const handleUploadVideo = async () => {
    if (!videoFile) {
      setError("Please select a video file")
      return
    }

    setUploading(true)
    setError("")

    const formData = new FormData()
    formData.append("file", videoFile)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.url) {
        setVideoUrl(data.url)
        setSuccess("Video uploaded successfully!")
      } else {
        setError("Failed to upload video")
      }
    } catch (err) {
      console.error("Error uploading video:", err)
      setError("Error uploading video")
    } finally {
      setUploading(false)
    }
  }

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions]
    newQuestions[index][field] = value
    setQuestions(newQuestions)
  }

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""] }])
  }

  const removeQuestion = (index) => {
    const newQuestions = [...questions]
    newQuestions.splice(index, 1)
    setQuestions(newQuestions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title || !description || !duration || !reward || !category || !difficulty || !videoUrl) {
      setError("Please fill in all required fields")
      return
    }

    // Validate questions
    for (const q of questions) {
      if (!q.question || q.options.some((opt) => !opt)) {
        setError("Please fill in all questions and options")
        return
      }
    }

    setCreating(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/ads/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          duration: Number.parseInt(duration),
          reward: Number.parseFloat(reward),
          category,
          difficulty,
          videoUrl,
          questions,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Ad created successfully!")
        // Reset form
        setTitle("")
        setDescription("")
        setDuration("")
        setReward("")
        setCategory("")
        setDifficulty("")
        setVideoFile(null)
        setVideoUrl("")
        setQuestions([{ question: "", options: ["", "", "", ""] }])
      } else {
        setError(data.error || "Failed to create ad")
      }
    } catch (err) {
      console.error("Error creating ad:", err)
      setError("Error creating ad")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <UserHeader />
      <main className="flex-1 container py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Create and manage ads for users to watch.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create New Ad</CardTitle>
              <CardDescription>Fill in the details below to create a new ad for users to watch.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reward">Reward ($)</Label>
                    <Input
                      id="reward"
                      type="number"
                      step="0.01"
                      value={reward}
                      onChange={(e) => setReward(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Fitness">Fitness</SelectItem>
                        <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty} required>
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Video</Label>
                  <div className="border rounded-md p-4">
                    {videoUrl ? (
                      <div className="space-y-4">
                        <div className="aspect-video bg-muted rounded-md overflow-hidden">
                          <video src={videoUrl} className="h-full w-full object-cover" controls />
                        </div>
                        <p className="text-sm text-muted-foreground break-all">{videoUrl}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Video className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No video uploaded</h3>
                        <p className="text-sm text-muted-foreground mt-1">Upload a video for users to watch.</p>
                        <div className="mt-4 flex items-center gap-4">
                          <Input
                            id="video"
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="max-w-xs"
                          />
                          <Button type="button" onClick={handleUploadVideo} disabled={!videoFile || uploading}>
                            {uploading ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Questions</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addQuestion}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Question
                    </Button>
                  </div>

                  {questions.map((q, qIndex) => (
                    <div key={qIndex} className="border rounded-md p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Question {qIndex + 1}</h3>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`question-${qIndex}`}>Question</Label>
                        <Input
                          id={`question-${qIndex}`}
                          value={q.question}
                          onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Options</Label>
                        <div className="grid gap-2">
                          {q.options.map((option, oIndex) => (
                            <Input
                              key={oIndex}
                              placeholder={`Option ${oIndex + 1}`}
                              value={option}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                              required
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md">{error}</div>}

                {success && <div className="bg-green-100 text-green-800 p-3 rounded-md">{success}</div>}
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmit} disabled={creating} className="w-full">
                {creating ? "Creating Ad..." : "Create Ad"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SI Earn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

