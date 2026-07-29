export interface VideoItem {
    id: string
    title: string
    time: string
    location: string
    activity: string
    uri?: string
}

export interface VideoGroup {
    label: string
    items: VideoItem[]
}
