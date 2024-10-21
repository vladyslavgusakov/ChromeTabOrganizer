export class OperationQueue {
  private queue: (() => Promise<void>)[] = [];
  private isProcessing: boolean = false;

  // Add a new operation to the queue
  public enqueue(operation: () => Promise<void>): void {
    this.queue.push(operation);
    this.processNext(); // Start processing the queue
  }

  // Process the next operation in the queue
  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return; // Avoid multiple concurrent operations
    }

    this.isProcessing = true;

    const nextOperation = this.queue.shift(); // Get the first operation in the queue

    if (nextOperation) {
      try {
        await nextOperation(); // Execute the operation
      } catch (error) {
        console.error("Operation failed:", error);
      }
    }

    this.isProcessing = false;
    if (this.queue.length > 0) {
      this.processNext(); // Process the next operation if there are more
    }
  }
}

// // Example usage
// const queue = new OperationQueue();

// queue.enqueue(async () => {
//   console.log("Operation 1 started");
//   await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async work
//   console.log("Operation 1 completed");
// });

// queue.enqueue(async () => {
//   console.log("Operation 2 started");
//   await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate async work
//   console.log("Operation 2 completed");
// });

// queue.enqueue(async () => {
//   console.log("Operation 3 started");
//   await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate async work
//   console.log("Operation 3 completed");
// });
