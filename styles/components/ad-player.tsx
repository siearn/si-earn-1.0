"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Play, Pause, DollarSign } from "lucide-react"

// Add proper types to the AdPlayer component

// Define the Ad type
interface Ad {
  id: string
  title: string
  description: string
  duration: number
  reward: number
  category: string
  difficulty: string
  videoUrl: string
  questions: {
    id: string
    question: string
    options: string[]
  }[]
}

// Define the props type
interface AdPlayerProps {
  ad: Ad
  onComplete: (adId: string, analyticsData: any) => void
  onCancel: () => void
}

// Update the component definition
export default function AdPlayer({ ad, onComplete, onCancel }: AdPlayerProps) {
  // Update state types
  const [stage, setStage] = useState<"intro" | "watching" | "questions" | "completed">("intro")
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState("")
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null)
  const [totalWatchTime, setTotalWatchTime] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  const questions = ad.questions || []

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [])

  const startWatching = () => {
    setStage("watching")
    setIsPlaying(true)
    setWatchStartTime(Date.now())

    if (videoRef.current) {
      videoRef.current.play()

      // Update progress every second
      progressInterval.current = setInterval(() => {
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime
          const duration = videoRef.current.duration
          const progress = (currentTime / duration) * 100
          setCurrentTime(currentTime)
          setProgress(progress)
        }
      }, 1000)
    }
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      if (videoRef.current) {
        videoRef.current.pause()
      }
      clearInterval(progressInterval.current)
      setIsPlaying(false)
    } else {
      if (videoRef.current) {
        videoRef.current.play()
      }
      setIsPlaying(true)

      // Update progress every second
      progressInterval.current = setInterval(() => {
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime
          const duration = videoRef.current.duration
          const progress = (currentTime / duration) * 100
          setCurrentTime(currentTime)
          setProgress(progress)
        }
      }, 1000)
    }
  }

  const handleVideoEnded = () => {
    clearInterval(progressInterval.current)
    setIsPlaying(false)
    setStage("questions")

    // Calculate total watch time
    const endTime = Date.now()
    const watchTimeMs = endTime - watchStartTime
    setTotalWatchTime(Math.floor(watchTimeMs / 1000))
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value)
  }

  const handleSubmit = () => {
    // Check if all questions are answered
    const allAnswered = questions.every((q) => answers[q.id])

    if (!allAnswered) {
      alert("Please answer all questions before submitting.")
      return
    }

    setStage("completed")

    // Prepare analytics data
    const analyticsData = {
      adId: ad.id,
      watchTime: totalWatchTime,
      answers: Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      })),
      feedback,
      completedAt: new Date().toISOString(),
    }

    // Notify parent component that the ad is complete
    setTimeout(() => {
      onComplete(ad.id, analyticsData)
    }, 2000)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={onCancel}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to ads
      </Button>

      {stage === "intro" && (
        <Card>
          <CardHeader>
            <CardTitle>{ad.title}</CardTitle>
            <CardDescription>{ad.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted relative rounded-md overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-16 w-16 text-muted-foreground opacity-70" />
              </div>
              {ad.videoUrl ? (
                <video
                  src={ad.videoUrl}
                  className="h-full w-full object-cover opacity-60"
                  ref={videoRef}
                  muted
                  playsInline
                  onEnded={handleVideoEnded}
                />
              ) : (
                <img
                  src={`/placeholder.svg?height=400&width=800&text=${encodeURIComponent(ad.category)}`}
                  alt={ad.title}
                  className="h-full w-full object-cover opacity-60"
                />
              )}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Duration:</span>
                  <span className="text-sm">
                    {Math.floor(ad.duration / 60)}:{(ad.duration % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">${ad.reward.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Watch this ad completely and answer a few questions to earn ${ad.reward.toFixed(2)}.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={startWatching}>
              Start Watching
            </Button>
          </CardFooter>
        </Card>
      )}

      {stage === "watching" && (
        <Card>
          <CardHeader>
            <CardTitle>{ad.title}</CardTitle>
            <div className="flex items-center justify-between">
              <CardDescription>
                {formatTime(currentTime)} / {formatTime(ad.duration)}
              </CardDescription>
              <span className="text-sm font-medium text-primary">${ad.reward.toFixed(2)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted relative rounded-md overflow-hidden">
              {ad.videoUrl ? (
                <video
                  src={ad.videoUrl}
                  className="h-full w-full object-cover"
                  ref={videoRef}
                  playsInline
                  onEnded={handleVideoEnded}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {isPlaying ? (
                    <Pause className="h-16 w-16 text-muted-foreground opacity-70" />
                  ) : (
                    <Play className="h-16 w-16 text-muted-foreground opacity-70" />
                  )}
                  <img
                    src={`/placeholder.svg?height=400&width=800&text=${encodeURIComponent(ad.category)}`}
                    alt={ad.title}
                    className="h-full w-full object-cover opacity-60"
                  />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Please watch the entire ad to earn your reward. You'll be asked questions about the content afterward.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={togglePlayPause}>
              {isPlaying ? "Pause" : "Resume"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {stage === "questions" && (
        <Card>
          <CardHeader>
            <CardTitle>Answer Questions</CardTitle>
            <CardDescription>Please answer the following questions about the ad you just watched.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q, index) => (
              <div key={q.id} className="space-y-3">
                <h3 className="font-medium">
                  {index + 1}. {q.question}
                </h3>
                <RadioGroup value={answers[q.id] || ""} onValueChange={(value) => handleAnswerChange(q.id, value)}>
                  {q.options.map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${q.id}-${i}`} />
                      <Label htmlFor={`${q.id}-${i}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
            <div className="space-y-3">
              <h3 className="font-medium">Additional Feedback (Optional)</h3>
              <Textarea
                placeholder="Share any additional thoughts about the ad..."
                value={feedback}
                onChange={handleFeedbackChange}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSubmit}>
              Submit & Earn ${ad.reward.toFixed(2)}
            </Button>
          </CardFooter>
        </Card>
      )}

      {stage === "completed" && (
        <Card>
          <CardHeader>
            <CardTitle>Thank You!</CardTitle>
            <CardDescription>Your responses have been recorded.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
              <DollarSign className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-center">You've earned ${ad.reward.toFixed(2)}</h3>
            <p className="text-center text-muted-foreground mt-2">Your balance will be updated shortly.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

