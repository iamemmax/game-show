"use client"
import { useMQTT } from "@/hooks/useMqttService"
import { useRef, useEffect, useState, useCallback } from "react"
import * as THREE from "three"

const RevealView = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const ballsRef = useRef<THREE.Mesh[]>([])
  const animationFrameRef = useRef<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  interface HustleMatch {
    contestant_id: number
    number_pick: number
    is_match: boolean
    is_extra_ball: boolean
    extra_ball_details: {
      name: string
      type: string
      effect_action: string | null
      effect_desc: string | null
    }
    balance_details: {
      is_gain: boolean
      previous_balance: number
      amount_gained: number
      amount_lost: number
      current_balance: number
    }
  }

  interface BallPickedPayload {
    hustle_match: HustleMatch
    number_revealed: number[]
  }

  interface BallPickedResult {
    event: string
    payload: BallPickedPayload
  }

  const [lastResult, setLastResult] = useState<BallPickedPayload | null>(null)
  const [revealedBalls, setRevealedBalls] = useState<Set<number>>(new Set())

  const { isConnected, onMessage, sendMessage } = useMQTT()

  useEffect(() => {
    const interval = setInterval(() => {
      const extraBallTypes = ["CRYSTAL_BALL", "KILLER_BALL", "EXTRA_DRAW", "GOLDEN_BALL"]
      const selectedExtraBall = extraBallTypes[Math.floor(Math.random() * extraBallTypes.length)]
      const isExtraBall = Math.random() > 0.6
      const isMatch = Math.random() > 0.7

      // Determine balance based on extra ball type
      let balanceDetails
      if (isExtraBall && selectedExtraBall === "CRYSTAL_BALL") {
        balanceDetails = {
          is_gain: true,
          previous_balance: 110000.0,
          amount_gained: Math.floor(Math.random() * 50000) + 10000,
          amount_lost: 0,
          current_balance: 110000.0 + Math.floor(Math.random() * 50000) + 10000,
        }
      } else if (isExtraBall && selectedExtraBall === "KILLER_BALL") {
        const lossAmount = Math.floor(Math.random() * 30000) + 5000
        balanceDetails = {
          is_gain: false,
          previous_balance: 110000.0,
          amount_gained: 0,
          amount_lost: lossAmount,
          current_balance: 110000.0 - lossAmount,
        }
      } else {
        balanceDetails = {
          is_gain: isMatch,
          previous_balance: 110000.0,
          amount_gained: isMatch ? Math.floor(Math.random() * 25000) : 0,
          amount_lost: 0,
          current_balance: 110000.0 + (isMatch ? Math.floor(Math.random() * 25000) : 0),
        }
      }

      const mockMessage = {
        event: "ball_picked",
        payload: {
          hustle_match: {
            contestant_id: 363,
            number_pick: Math.floor(Math.random() * 60) + 1,
            is_match: isMatch,
            is_extra_ball: isExtraBall,
            extra_ball_details: {
              name: selectedExtraBall,
              type: selectedExtraBall === "CRYSTAL_BALL" ? "HIGH_CRYSTAL" : "STANDARD",
              effect_action: selectedExtraBall === "EXTRA_DRAW" ? "ADD_PICK" : null,
              effect_desc: selectedExtraBall === "EXTRA_DRAW" ? "Grants one additional pick" : null,
            },
            balance_details: balanceDetails,
          },
          number_revealed: [Math.floor(Math.random() * 60) + 1],
        },
      }
      sendMessage(mockMessage, "ball_picked")
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup - no background color to use app background
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(0, 0, 30)
    cameraRef.current = camera

    // Renderer setup - transparent background
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setClearColor(0x000000, 0) // Transparent background
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(10, 10, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Spotlight for dramatic effect
    const spotlight = new THREE.SpotLight(0x00ffff, 1, 100, Math.PI / 6, 0.1, 1)
    spotlight.position.set(0, 20, 20)
    spotlight.target.position.set(0, 0, 0)
    scene.add(spotlight)
    scene.add(spotlight.target)

    // Create ball grid
    createBallGrid(scene)

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return

      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement)
      }
      rendererRef.current?.dispose()
    }
  }, [])

  // Create ball grid
  interface CreateBallGridScene {
    add: (object: THREE.Object3D) => void
  }

  const createBallGrid = (scene: CreateBallGridScene) => {
    const ballGeometry = new THREE.SphereGeometry(1.5, 32, 32)
    const ballMaterial = new THREE.MeshPhongMaterial({
      color: 0x9c4dcc,
      shininess: 100,
      specular: 0x222222,
    })

    ballsRef.current = []

    // Create 60 balls in a grid
    for (let i = 0; i < 60; i++) {
      const ball: THREE.Mesh = new THREE.Mesh(ballGeometry, ballMaterial.clone())

      // Position in grid (10 columns, 6 rows)
      const col: number = i % 10
      const row: number = Math.floor(i / 10)

      ball.position.x = (col - 4.5) * 4.2
      ball.position.y = (2.5 - row) * 4.2
      ball.position.z = 0

      ball.castShadow = true
      ball.receiveShadow = true

      // Add number text
      const canvas: HTMLCanvasElement = document.createElement("canvas")
      const context = canvas.getContext("2d")
      canvas.width = 512 // Increased from 256
      canvas.height = 512 // Increased from 256

      if (context) {
        // Add stroke for thickness
        context.strokeStyle = "#000000"
        context.lineWidth = 8
        context.fillStyle = "#ffffff"
        context.font = "bold 180px Arial" // Increased from 96px
        context.textAlign = "center"
        context.textBaseline = "middle"

        const text = (i + 1).toString()
        const centerX = 256 // Updated center position
        const centerY = 256 // Updated center position

        // Draw stroke first for thickness
        context.strokeText(text, centerX, centerY)
        // Then fill
        context.fillText(text, centerX, centerY)
      }

      const texture: THREE.CanvasTexture = new THREE.CanvasTexture(canvas)
      const numberMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      })

      const numberGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(2.8, 2.8) // Increased from 1, 1
      const numberMesh: THREE.Mesh = new THREE.Mesh(numberGeometry, numberMaterial)
      numberMesh.position.z = 1.51 // Increased from 0.81 to sit on larger ball surface
      ball.add(numberMesh)

      scene.add(ball)
      ballsRef.current.push(ball)
    }
  }

  // Handle ball reveal animation
  interface AnimateBallRevealResult {
    hustle_match: HustleMatch
    number_revealed: number[]
  }

  const animateBallReveal = useCallback(async (ballNumber: number, result: AnimateBallRevealResult): Promise<void> => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return

    setIsAnimating(true)
    const ball = ballsRef.current[ballNumber - 1]
    if (!ball) return

    // Store original position
    const originalPosition = ball.position.clone()

    // Phase 1: Move ball to center and scale up
    await animateToCenter(ball)

    // Phase 2: Split ball effect with dramatic reveal
    await animateBallSplit(ball, result)

    // Phase 3: Show result
    await showResult(result)

    // Phase 4: Animate ball back to position with new color
    await animateBallReturn(ball, originalPosition, result)

    // Phase 5: Mark as revealed and finish
    setRevealedBalls((prev: Set<number>) => new Set([...prev, ballNumber]))
    setIsAnimating(false)
  }, [])

  interface AnimateToCenterBall {
    position: THREE.Vector3
    scale: THREE.Vector3
    rotation: THREE.Euler
  }

  const animateToCenter = (ball: AnimateToCenterBall): Promise<void> => {
    return new Promise((resolve) => {
      const startPos = ball.position.clone()
      const endPos = new THREE.Vector3(0, 0, 8)
      const duration = 1500
      const startTime = Date.now()

      const animate = (): void => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Ease out animation
        const easeProgress = 1 - Math.pow(1 - progress, 3)

        ball.position.lerpVectors(startPos, endPos, easeProgress)
        ball.scale.setScalar(1 + easeProgress * 2) // Scale up to 3x size

        // Add rotation for drama
        ball.rotation.y = easeProgress * Math.PI * 2
        ball.rotation.x = easeProgress * Math.PI

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve(undefined)
        }
      }

      animate()
    })
  }

  const animateBallSplit = (ball: THREE.Mesh, result: any): Promise<void> => {
    return new Promise((resolve) => {
      if (!sceneRef.current) return

      // Hide the original ball
      ball.visible = false

      // Create two hemisphere geometries
      const radius = 1.5 * ball.scale.x
      const topHemisphere = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
      const bottomHemisphere = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)

      // Create materials for the hemispheres
      const ballMaterial = ball.material as THREE.MeshPhongMaterial
      const topMaterial = ballMaterial.clone()
      const bottomMaterial = ballMaterial.clone()

      // Create hemisphere meshes
      const topHalf = new THREE.Mesh(topHemisphere, topMaterial)
      const bottomHalf = new THREE.Mesh(bottomHemisphere, bottomMaterial)

      // Position at ball location
      topHalf.position.copy(ball.position)
      bottomHalf.position.copy(ball.position)

      // Add to scene
      sceneRef.current.add(topHalf)
      sceneRef.current.add(bottomHalf)

      // Create dramatic lighting effect based on extra ball type
      let lightColor = 0x4444ff // Default blue
      if (result.hustle_match.is_extra_ball) {
        if (result.hustle_match.extra_ball_details.name === "CRYSTAL_BALL") {
          lightColor = 0x00ffff // Cyan for crystal
        } else if (result.hustle_match.extra_ball_details.name === "KILLER_BALL") {
          lightColor = 0xff0000 // Red for killer
        } else if (result.hustle_match.extra_ball_details.name === "EXTRA_DRAW") {
          lightColor = 0xffd700 // Gold for extra draw
        }
      } else if (result.hustle_match.is_match) {
        lightColor = 0x00ff00 // Green for match
      }

      const revealLight = new THREE.PointLight(lightColor, 3, 25)
      revealLight.position.copy(ball.position)
      sceneRef.current.add(revealLight)

      // Animation phases
      const splitDuration = 1000
      const contentDuration = 2000
      const startTime = Date.now()

      let contentGroup: THREE.Group | null = null

      const animate = () => {
        const elapsed = Date.now() - startTime
        const splitProgress = Math.min(elapsed / splitDuration, 1)
        const contentProgress = Math.max(0, Math.min((elapsed - splitDuration * 0.5) / contentDuration, 1))

        if (elapsed < splitDuration + contentDuration) {
          // Phase 1: Split the hemispheres
          if (splitProgress < 1) {
            const easeProgress = 1 - Math.pow(1 - splitProgress, 3)
            const splitDistance = easeProgress * 2.5

            topHalf.position.y = ball.position.y + splitDistance
            bottomHalf.position.y = ball.position.y - splitDistance

            // Add slight rotation for more drama
            topHalf.rotation.x = easeProgress * 0.3
            bottomHalf.rotation.x = -easeProgress * 0.3
          }

          // Phase 2: Animate content emerging from the gap
          if (contentProgress > 0 && !contentGroup) {
            contentGroup = createRevealContent(result, ball.position)
            if (contentGroup && sceneRef.current) {
              sceneRef.current.add(contentGroup)
            }
          }

          if (contentGroup && contentProgress > 0) {
            animateRevealContent(contentGroup, contentProgress, result)
          }

          // Animate light intensity with pulsing effect
          revealLight.intensity = 3 + Math.sin(elapsed * 0.01) * 1

          requestAnimationFrame(animate)
        } else {
          // Clean up
          sceneRef.current?.remove(topHalf)
          sceneRef.current?.remove(bottomHalf)
          sceneRef.current?.remove(revealLight)

          // Keep content visible for a moment longer
          setTimeout(() => {
            if (contentGroup) {
              sceneRef.current?.remove(contentGroup)
            }
            resolve(undefined)
          }, 1500)
        }
      }

      animate()
    })
  }

  const animateBallReturn = (ball: THREE.Mesh, originalPosition: THREE.Vector3, result: any): Promise<void> => {
    return new Promise((resolve) => {
      // Make ball visible again
      ball.visible = true

      const startPos = ball.position.clone()
      const duration = 1000
      const startTime = Date.now()

      // Set new color based on result type
      const meshMaterial = ball.material as THREE.MeshPhongMaterial
      let newColor = 0x4444ff // Default blue

      if (result.hustle_match.is_extra_ball) {
        if (result.hustle_match.extra_ball_details.name === "CRYSTAL_BALL") {
          newColor = 0x00ffff // Cyan for crystal ball
        } else if (result.hustle_match.extra_ball_details.name === "KILLER_BALL") {
          newColor = 0xff0000 // Red for killer ball
        } else if (result.hustle_match.extra_ball_details.name === "EXTRA_DRAW") {
          newColor = 0xffd700 // Gold for extra draw
        }
      } else if (result.hustle_match.is_match) {
        newColor = 0x00ff00 // Green for match
      } else {
        newColor = 0xff4444 // Red for no match
      }

      const animate = (): void => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Ease in animation
        const easeProgress = Math.pow(progress, 2)

        // Animate position back to original
        ball.position.lerpVectors(startPos, originalPosition, easeProgress)

        // Scale back to normal size
        const currentScale = 3 - easeProgress * 2 // From 3x back to 1x
        ball.scale.setScalar(currentScale)

        // Gradually change color
        meshMaterial.color.setHex(newColor)
        meshMaterial.opacity = 0.8
        meshMaterial.transparent = true

        // Add slight rotation as it returns
        ball.rotation.y = (1 - easeProgress) * Math.PI * 2
        ball.rotation.x = (1 - easeProgress) * Math.PI

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Final cleanup
          ball.rotation.set(0, 0, 0)
          resolve(undefined)
        }
      }

      animate()
    })
  }

  const createRevealContent = (result: any, position: THREE.Vector3): THREE.Group => {
    const group = new THREE.Group()
    group.position.copy(position)

    const { hustle_match } = result

    if (hustle_match.is_extra_ball) {
      if (hustle_match.extra_ball_details.name === "CRYSTAL_BALL") {
        createCrystalBallContent(group, hustle_match)
      } else if (hustle_match.extra_ball_details.name === "KILLER_BALL") {
        createKillerBallContent(group, hustle_match)
      } else if (hustle_match.extra_ball_details.name === "EXTRA_DRAW") {
        createExtraDrawContent(group, hustle_match)
      } else {
        createExtraBallContent(group, hustle_match)
      }
    } else if (hustle_match.balance_details.amount_gained > 0) {
      // Money gain - cash and coins
      createMoneyGainContent(group, hustle_match)
    } else {
      // Regular number - just number display
      createNumberContent(group, hustle_match)
    }

    return group
  }

  const createCrystalBallContent = (group: THREE.Group, hustle_match: any) => {
    // Cyan crystal glow
    const glowGeometry = new THREE.SphereGeometry(0.3, 16, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
    })
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial)
    group.add(glowSphere)

    // Create crystal-like particles
    for (let i = 0; i < 25; i++) {
      const crystalGeometry = new THREE.OctahedronGeometry(0.05)
      const crystalMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff })
      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial)

      crystal.userData = {
        originalY: (Math.random() - 0.5) * 3,
        speed: 0.02 + Math.random() * 0.03,
        amplitude: 0.5 + Math.random() * 0.5,
      }

      group.add(crystal)
    }

    group.userData.type = "crystal_ball"
    group.userData.amount = hustle_match.balance_details.amount_gained
  }

  const createExtraDrawContent = (group: THREE.Group, hustle_match: any) => {
    // Golden glow for extra draw
    const glowGeometry = new THREE.SphereGeometry(0.25, 16, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.5,
    })
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial)
    group.add(glowSphere)

    // Create plus symbols
    for (let i = 0; i < 8; i++) {
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      canvas.width = 64
      canvas.height = 64

      if (context) {
        context.fillStyle = "#ffd700"
        context.font = "bold 48px Arial"
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.fillText("+1", 32, 32)
      }

      const texture = new THREE.CanvasTexture(canvas)
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      })
      const geometry = new THREE.PlaneGeometry(0.4, 0.4)
      const plusSign = new THREE.Mesh(geometry, material)

      plusSign.userData = {
        originalAngle: (i / 8) * Math.PI * 2,
        radius: 0.8 + Math.random() * 0.6,
        speed: 0.03 + Math.random() * 0.02,
        floatSpeed: 0.025 + Math.random() * 0.01,
      }

      group.add(plusSign)
    }

    group.userData.type = "extra_draw"
  }

  const createExtraBallContent = (group: THREE.Group, hustle_match: any) => {
    // Golden glow sphere
    const glowGeometry = new THREE.SphereGeometry(0.3, 16, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.6,
    })
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial)
    group.add(glowSphere)

    // Create floating golden particles
    for (let i = 0; i < 20; i++) {
      const starGeometry = new THREE.SphereGeometry(0.05, 8, 8)
      const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 })
      const star = new THREE.Mesh(starGeometry, starMaterial)

      star.userData = {
        originalY: (Math.random() - 0.5) * 3,
        speed: 0.02 + Math.random() * 0.03,
        amplitude: 0.5 + Math.random() * 0.5,
      }

      group.add(star)
    }

    group.userData.type = "extra_ball"
    group.userData.text = hustle_match.extra_ball_details.name
  }

  const createMoneyGainContent = (group: THREE.Group, hustle_match: any) => {
    // Green glow for money
    const glowGeometry = new THREE.SphereGeometry(0.2, 16, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.4,
    })
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial)
    group.add(glowSphere)

    // Create coin-like objects
    for (let i = 0; i < 15; i++) {
      const coinGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16)
      const coinMaterial = new THREE.MeshPhongMaterial({
        color: 0xffd700,
        shininess: 100,
      })
      const coin = new THREE.Mesh(coinGeometry, coinMaterial)

      coin.userData = {
        originalAngle: (i / 15) * Math.PI * 2,
        radius: 0.5 + Math.random() * 1,
        speed: 0.03 + Math.random() * 0.02,
        floatSpeed: 0.02 + Math.random() * 0.01,
      }

      group.add(coin)
    }

    // Create floating dollar signs
    for (let i = 0; i < 8; i++) {
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      canvas.width = 64
      canvas.height = 64

      if (context) {
        context.fillStyle = "#00ff00"
        context.font = "bold 48px Arial"
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.fillText("$", 32, 32)
      }

      const texture = new THREE.CanvasTexture(canvas)
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      })
      const geometry = new THREE.PlaneGeometry(0.3, 0.3)
      const dollarSign = new THREE.Mesh(geometry, material)

      dollarSign.userData = {
        originalAngle: (i / 8) * Math.PI * 2,
        radius: 1.2 + Math.random() * 0.8,
        speed: 0.02 + Math.random() * 0.015,
        floatSpeed: 0.025 + Math.random() * 0.01,
      }

      group.add(dollarSign)
    }

    group.userData.type = "money_gain"
    group.userData.amount = hustle_match.balance_details.amount_gained
  }

  const createKillerBallContent = (group: THREE.Group, hustle_match: any) => {
    // Red/dark glow for killer ball
    const glowGeometry = new THREE.SphereGeometry(0.25, 16, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
    })
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial)
    group.add(glowSphere)

    // Create skull or danger symbols
    for (let i = 0; i < 6; i++) {
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      canvas.width = 64
      canvas.height = 64

      if (context) {
        context.fillStyle = "#ff0000"
        context.font = "bold 40px Arial"
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.fillText("💀", 32, 32)
      }

      const texture = new THREE.CanvasTexture(canvas)
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      })
      const geometry = new THREE.PlaneGeometry(0.4, 0.4)
      const skull = new THREE.Mesh(geometry, material)

      skull.userData = {
        originalAngle: (i / 6) * Math.PI * 2,
        radius: 0.8 + Math.random() * 0.6,
        speed: 0.04 + Math.random() * 0.02,
        floatSpeed: 0.03 + Math.random() * 0.015,
      }

      group.add(skull)
    }

    // Create red particles flowing downward
    for (let i = 0; i < 12; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8)
      const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 })
      const particle = new THREE.Mesh(particleGeometry, particleMaterial)

      particle.userData = {
        originalY: Math.random() * 2,
        fallSpeed: 0.02 + Math.random() * 0.02,
        sideSpeed: (Math.random() - 0.5) * 0.01,
      }

      group.add(particle)
    }

    group.userData.type = "killer_ball"
    group.userData.amount = hustle_match.balance_details.amount_lost
  }

  const createNumberContent = (group: THREE.Group, hustle_match: any) => {
    // Blue glow for regular numbers
    const glowGeometry = new THREE.SphereGeometry(0.2, 16, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4444ff,
      transparent: true,
      opacity: 0.4,
    })
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial)
    group.add(glowSphere)

    // Create the main number
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    canvas.width = 128
    canvas.height = 128

    if (context) {
      context.fillStyle = "#ffffff"
      context.font = "bold 72px Arial"
      context.textAlign = "center"
      context.textBaseline = "middle"
      context.fillText(hustle_match.number_pick.toString(), 64, 64)
    }

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    })
    const geometry = new THREE.PlaneGeometry(1, 1)
    const numberMesh = new THREE.Mesh(geometry, material)

    group.add(numberMesh)

    // Create floating number particles
    for (let i = 0; i < 10; i++) {
      const smallCanvas = document.createElement("canvas")
      const smallContext = smallCanvas.getContext("2d")
      smallCanvas.width = 32
      smallCanvas.height = 32

      if (smallContext) {
        smallContext.fillStyle = "#4444ff"
        smallContext.font = "bold 24px Arial"
        smallContext.textAlign = "center"
        smallContext.textBaseline = "middle"
        smallContext.fillText(hustle_match.number_pick.toString(), 16, 16)
      }

      const smallTexture = new THREE.CanvasTexture(smallCanvas)
      const smallMaterial = new THREE.MeshBasicMaterial({
        map: smallTexture,
        transparent: true,
      })
      const smallGeometry = new THREE.PlaneGeometry(0.2, 0.2)
      const smallNumber = new THREE.Mesh(smallGeometry, smallMaterial)

      smallNumber.userData = {
        originalAngle: (i / 10) * Math.PI * 2,
        radius: 0.6 + Math.random() * 0.4,
        speed: 0.025 + Math.random() * 0.015,
        floatSpeed: 0.02 + Math.random() * 0.01,
      }

      group.add(smallNumber)
    }

    group.userData.type = "number"
  }

  const animateRevealContent = (group: THREE.Group, progress: number, result: any) => {
    const time = Date.now() * 0.001

    group.children.forEach((child, index) => {
      if (child.userData.originalAngle !== undefined) {
        // Circular floating animation
        const angle = child.userData.originalAngle + time * child.userData.speed
        const radius = child.userData.radius * progress

        child.position.x = Math.cos(angle) * radius
        child.position.z = Math.sin(angle) * radius
        child.position.y = Math.sin(time * child.userData.floatSpeed + index) * 0.3

        // Rotation
        child.rotation.y = time * 2
      } else if (child.userData.fallSpeed !== undefined) {
        // Falling animation for killer ball particles
        child.position.y = child.userData.originalY - time * child.userData.fallSpeed * progress
        child.position.x += child.userData.sideSpeed

        // Reset if fallen too far
        if (child.position.y < -3) {
          child.position.y = 2
        }
      } else if (child.userData.originalY !== undefined) {
        // Floating animation for extra ball particles
        const floatOffset = Math.sin(time * child.userData.speed + index) * child.userData.amplitude
        child.position.y = child.userData.originalY + floatOffset * progress
        child.position.x = Math.cos(time * child.userData.speed + index) * 0.3 * progress
        child.position.z = Math.sin(time * child.userData.speed + index * 0.7) * 0.3 * progress
      }
    })

    // Scale the entire group based on progress
    const scale = progress * 1.5
    group.scale.setScalar(scale)

    // Rotation for the main content
    group.rotation.y = time * 0.5
  }

  const showResult = (result: AnimateBallRevealResult) => {
    return new Promise((resolve) => {
      setLastResult(result)
      setTimeout(resolve, 3000)
    })
  }

  // Handle MQTT messages
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.event === "ball_picked") {
        const { hustle_match } = message.payload
        animateBallReveal(hustle_match.number_pick, message.payload)
      }
    }

    if (isConnected) {
      onMessage(handleMessage)
    }

    return () => {
      if (isConnected) {
        onMessage(null)
      }
    }
  }, [isConnected, onMessage, animateBallReveal])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D Scene */}
      <div ref={mountRef} className="w-full h-full" />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Header */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            RAFFLE REVEAL
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-white/70 text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>

        {/* Status */}
        <div className="absolute top-8 right-8 bg-black/50 backdrop-blur-sm rounded-lg p-4">
          <div className="text-white/70 text-sm mb-1">Balls Revealed</div>
          <div className="text-2xl font-bold text-white">{revealedBalls.size}/60</div>
        </div>

        {/* Result Display */}
        {lastResult && !isAnimating && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-6 text-center max-w-md">
            <div className="text-2xl font-bold text-white mb-2">Ball #{lastResult.hustle_match.number_pick}</div>

            {lastResult.hustle_match.is_extra_ball && (
              <div className="text-yellow-400 font-bold mb-2">✨ {lastResult.hustle_match.extra_ball_details.name}</div>
            )}

            {lastResult.hustle_match.balance_details.is_gain ? (
              <div className="text-green-400 font-bold">
                🎉 GAIN! +${lastResult.hustle_match.balance_details.amount_gained.toLocaleString()}
              </div>
            ) : lastResult.hustle_match.balance_details.amount_lost > 0 ? (
              <div className="text-red-400 font-bold">
                💀 LOSS! -${lastResult.hustle_match.balance_details.amount_lost.toLocaleString()}
              </div>
            ) : (
              <div className="text-blue-400 font-bold">📍 Number Revealed</div>
            )}

            <div className="text-white/70 text-sm mt-2">
              Balance: ${lastResult.hustle_match.balance_details.current_balance.toLocaleString()}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-8 left-8 bg-black/50 backdrop-blur-sm rounded-lg p-4 max-w-xs">
          <div className="text-white/70 text-sm">Waiting for ball picks from the host interface...</div>
        </div>
      </div>
    </div>
  )
}

export default RevealView
