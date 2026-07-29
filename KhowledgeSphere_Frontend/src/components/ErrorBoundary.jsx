import React from 'react';
import ErrorState from './ErrorState';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled KnowledgeSphere error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <ErrorState
            type="server"
            title="Something went wrong"
            description="We're having trouble loading this content. Please try refreshing or retrying."
            onAction={this.handleReset}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
