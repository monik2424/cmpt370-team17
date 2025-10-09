import React from 'react'

export default function Map() {
  return (
    <div><header className="absolute top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">EventFinder</h1>
              <p className="text-sm text-muted-foreground">Discover events in your area</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{12312}</div>
                  <div className="text-xs text-muted-foreground">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{1231}</div>
                  <div className="text-xs text-muted-foreground">Attendees</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{1}</div>
                  <div className="text-xs text-muted-foreground">Tracking</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header></div>
  )
}
