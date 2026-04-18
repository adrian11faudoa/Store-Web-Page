import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Unexpected frontend error',
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="panel auth-panel">
          <p className="eyebrow">Frontend error</p>
          <h1>We hit a render failure.</h1>
          <p>{this.state.message}</p>
        </section>
      )
    }

    return this.props.children
  }
}
