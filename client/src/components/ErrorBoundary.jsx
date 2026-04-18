import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('UI error boundary caught an error', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="section">
          <div className="container empty-state">
            <h1>Something went wrong</h1>
            <p>The interface hit an unexpected error. Refresh the page to try again.</p>
          </div>
        </section>
      )
    }

    return this.props.children
  }
}
