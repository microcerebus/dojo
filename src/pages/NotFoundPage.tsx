import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="card empty stack-4">
      <h1>Not found</h1>
      <p className="lede">That module or page does not exist.</p>
      <p>
        <Link to="/">Back to the curriculum</Link>
      </p>
    </div>
  );
}
