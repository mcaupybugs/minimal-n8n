# Minimal n8n - Workflow Automation Tool

A minimal n8n-like workflow automation tool built with Next.js, React Flow, and OpenAI. Create visual workflows with drag-and-drop nodes, including powerful AI-powered nodes for text generation, content analysis, and more.

## 🚀 Features

### Visual Workflow Builder

- **Drag & Drop Interface** - Intuitive node placement on canvas
- **Node Connections** - Visual data flow between nodes
- **Real-time Execution** - Watch workflows run with animated feedback
- **Node Configuration** - Double-click to configure each node

### Node Types

#### 🔵 Trigger Nodes

- **Webhook Trigger** - Start workflows from HTTP requests
- **Schedule Trigger** - Run workflows on a schedule

#### 🌟 AI Nodes (Powered by OpenAI)

- **AI Text Generator** - Generate text using GPT models
- **AI Content Analyzer** - Analyze sentiment, extract keywords, or summarize
- **AI Chatbot** - Generate conversational responses
- **AI Data Extractor** - Extract structured data from text

#### 🟢 Action Nodes

- **HTTP Request** - Make API calls to external services
- **Data Transform** - Transform data using JavaScript
- **Send Email** - Send emails (simulated)

#### 🟣 Logic Nodes

- **If/Else** - Conditional branching
- **Delay** - Wait for specified time

## 📦 Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe code
- **React Flow** - Visual workflow canvas
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Azure OpenAI API** - AI functionality
- **Lucide React** - Beautiful icons

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/mcaupybugs/minimal-n8n
cd minimal-n8n
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.local.example .env
```

Edit `.env` and add your Azure OpenAI credentials:

```
AZURE_OPENAI_ENDPOINT="https://<your-resource-name>.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT_ID="gpt-4o"
AZURE_OPENAI_API_KEY="your_azure_openai_api_key_here"
```

Get your credentials from [Azure Portal](https://portal.azure.com/)

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Creating a Workflow

1. **Drag nodes** from the sidebar onto the canvas
2. **Connect nodes** by dragging from one node's output (right) to another's input (left)
3. **Configure nodes** by double-clicking them
4. **Execute** by clicking the "Execute" button in the sidebar

### Example Workflows

#### AI Content Generator

```
Webhook Trigger → AI Text Generator → Send Email
```

Generate blog posts or content on demand

#### Smart Customer Support

```
Webhook Trigger → AI Content Analyzer → If/Else → AI Chatbot
```

Analyze sentiment and route to appropriate response

#### Data Processor

```
Schedule Trigger → HTTP Request → AI Data Extractor → Data Transform
```

Periodically fetch and structure data

## 📁 Project Structure

```
minimal-n8n/
├── app/
│   ├── api/
│   │   └── ai/
│   │       └── execute/
│   │           └── route.ts          # AI execution API
│   ├── page.tsx                      # Main workflow canvas
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
├── components/
│   ├── ui/                           # UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── label.tsx
│   │   └── select.tsx
│   ├── Sidebar.tsx                   # Node library sidebar
│   ├── CustomNode.tsx                # Custom node component
│   └── NodeConfigPanel.tsx           # Node configuration panel
├── lib/
│   ├── types.ts                      # TypeScript types
│   ├── store.ts                      # Zustand store
│   ├── node-definitions.ts           # Node type definitions
│   ├── executor.ts                   # Workflow execution engine
│   └── utils.ts                      # Utility functions
├── SCRIPT.md                         # YouTube tutorial script
└── README.md
```

## 🎓 Tutorial

This project includes a comprehensive tutorial script in `SCRIPT.md` for creating YouTube videos. The script covers:

- **Episode 1**: Project setup and architecture
- **Episode 2**: Building the canvas with React Flow
- **Episode 3**: Creating custom nodes and drag-drop
- **Episode 4**: AI integration and workflow execution
- **Episode 5**: Polish and advanced features

Each episode includes:

- Detailed code explanations
- What to say while coding
- Key learning points
- Demo suggestions

## 🔧 Extending the Application

### Adding a New Node Type

1. **Define the node** in `lib/node-definitions.ts`:

```typescript
myCustomNode: {
  type: 'myCustomNode',
  label: 'My Custom Node',
  description: 'Does something amazing',
  category: 'action',
  icon: Star,
  color: 'bg-yellow-500',
  defaultConfig: { /* ... */ },
  configFields: [ /* ... */ ]
}
```

2. **Implement execution** in `lib/executor.ts`:

```typescript
case 'myCustomNode':
  return this.executeMyCustomNode(config, input);
```

3. **Add the handler**:

```typescript
private executeMyCustomNode(config: any, input: any) {
  // Your logic here
  return {
    success: true,
    output: { /* ... */ }
  };
}
```

### Adding More AI Capabilities

- **Image Generation**: Use DALL-E API
- **Speech-to-Text**: Integrate Whisper API
- **Vision**: Analyze images with GPT-4 Vision
- **Embeddings**: For semantic search

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variable: `OPENAI_API_KEY`
4. Deploy!

### Environment Variables in Production

Make sure to set:

- `OPENAI_API_KEY` - Your OpenAI API key

## 📝 License

MIT License - feel free to use this for your projects!

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Add new node types
- Improve the UI
- Fix bugs
- Add tests
- Improve documentation

## 💡 Ideas for Enhancement

- [ ] Save/load workflows to database
- [ ] User authentication
- [ ] Workflow scheduling with cron
- [ ] Real webhook endpoints
- [ ] Node marketplace
- [ ] Collaboration features
- [ ] Version control for workflows
- [ ] Execution history and logs
- [ ] Cost tracking for AI usage
- [ ] Mobile responsive design
- [ ] Dark mode improvements
- [ ] Keyboard shortcuts
- [ ] Undo/redo functionality
- [ ] Workflow templates library
- [ ] Export/import workflows as JSON
- [ ] Performance monitoring

## 🐛 Known Issues

- Nodes need to be configured before execution (validation coming soon)
- No undo/redo yet
- Large workflows might have performance issues

## 📧 Support

For questions or issues:

- Open a GitHub issue
- Check the `SCRIPT.md` for detailed explanations
- Review the code comments

## 🌟 Acknowledgments

- [n8n](https://n8n.io/) - Inspiration for this project
- [React Flow](https://reactflow.dev/) - Amazing workflow library
- [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) - AI capabilities
- [Vercel](https://vercel.com/) - Deployment platform

---

Built with ❤️ for YouTube tutorials
# minimal-n8n
