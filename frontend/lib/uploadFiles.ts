export async function uploadFiles(files: File[], setProgress: (progress: { [key: string]: number }) => void) {
  // Mock upload: returns array of file names as URLs/IDs
  let uploaded: string[] = []
  let progress: { [key: string]: number } = {}
  for (const file of files) {
    // Simulate upload progress
    for (let p = 0; p <= 100; p += 20) {
      await new Promise(res => setTimeout(res, 30))
      progress[file.name] = p
      setProgress({ ...progress })
    }
    // In real app, upload to server and get URL/ID
    uploaded.push(`/uploads/${file.name}`)
  }
  return uploaded
}
