import './App.css'
import FileInputComponent from './file';

function App() {
  const heading: string = "Welcome to Image Compression App!";
  const subheading: string = "Upload a png file to get started!";
  
  return (
    <div>
      <h1>{heading}</h1>
      <h3>{subheading}</h3>
      <div>
        <FileInputComponent/>
      </div>
    </div>
  );
}

export default App
