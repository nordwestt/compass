import LogService from "@/utils/LogService";
import { MentionedCharacter } from "../components/chat/ChatInput";
import { ChatProviderFactory } from "../services/chat/ChatProviderFactory";
import { Thread } from "../types/core";
import { ChatMessage } from "../types/core";
import { Character } from "../types/core";
import { searchRelevantPassages } from "../utils/semanticSearch";
import { toastService } from "../services/toastService";
import { fetchSiteText } from "../utils/siteFetcher";

export const urlContentTransform: MessageTransform = {
    name: 'urlContent',
    transform: async (ctx: MessageContext): Promise<MessageContext> => {
      const urls = ctx.message.match(/https?:\/\/[^\s]+/g);
      if (!urls?.length) return ctx;
  
      toastService.info({ 
        title: 'Processing URLs', 
        description: 'Fetching content from links...' 
      });
  
      const webContent: string[] = [];
      
      for (const url of urls) {
        try {
          const content = await fetchSiteText(url);
          webContent.push(`Content from ${url}:\n${content}\n`);
        } catch (error: any) {
          LogService.log(error, { 
            component: 'urlContentTransform', 
            function: 'transform' 
          }, 'error');
          toastService.warning({
            title: 'URL Processing Error',
            description: `Failed to process ${url}`
          });
        }
      }
  
      // Store web content in metadata for next transform
      ctx.metadata.webContent = webContent;
      ctx.metadata.urls = urls;
      
      return ctx;
    }
  };

export const relevantPassagesTransform: MessageTransform = {
    name: 'relevantPassages',
    transform: async (ctx: MessageContext): Promise<MessageContext> => {
      const { webContent, urls } = ctx.metadata;
      if (!webContent?.length) return ctx;
  
      console.log("webContent",webContent);
      const messageWithoutUrls = ctx.message.replace(urls.join('|') || '', '');
      console.log("messageWithoutUrls",messageWithoutUrls);
      const relevantPassages = await searchRelevantPassages(
        messageWithoutUrls,
        webContent.join('\n'),
        ChatProviderFactory.getProvider(ctx.thread.selectedModel),
        {
          maxChunkSize: 512,
          minSimilarity: 0.3,
          maxResults: 5
        }
      );
      console.log("relevantPassages",relevantPassages);
      if (relevantPassages.length > 0) {
        ctx.context.messagesToSend.push({
          content: `Web content context:\n${relevantPassages.map(p => p.text).join('\n')}`,
          isSystem: true,
          isUser: false
        });
      }
  
      return ctx;
    }
  };

  export class MessageTransformPipeline {
    private transforms: MessageTransform[] = [];
  
    addTransform(transform: MessageTransform) {
      this.transforms.push(transform);
      return this;
    }
  
    async process(initialContext: MessageContext): Promise<MessageContext> {
      return this.transforms.reduce(
        async (contextPromise, transform) => {
          const context = await contextPromise;
          try {
            return await transform.transform(context);
          } catch (error: any) {
            LogService.log(error, {
              component: 'MessageTransformPipeline',
              function: transform.name
            }, 'error');
            return context; // Continue pipeline even if one transform fails
          }
        },
        Promise.resolve(initialContext)
      );
    }
  }
  
  export interface MessageContext {
    message: string;
    thread: Thread;
    mentionedCharacters: MentionedCharacter[];
    context: {
      messagesToSend: ChatMessage[];
      historyToSend: ChatMessage[];
      assistantPlaceholder: ChatMessage;
      useMention: boolean;
      characterToUse: Character;
    };
    metadata: Record<string, any>; // For storing intermediate data between transforms
  }
  
  export interface MessageTransform {
    name: string;
    transform: (ctx: MessageContext) => Promise<MessageContext>;
  }