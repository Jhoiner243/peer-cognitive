import { Message, MessageContent } from "./ai-elements/message-simple"
import { Card, CardContent } from "./ui/card"

export const MessageResponse = ({message}: {message: string}) => {
    return (
        <div>
          <Card>
            <CardContent>
            <Message from="assistant">
                <MessageContent key={message}>
                  <p>{message}</p>
                </MessageContent>
              </Message>
            </CardContent>
          </Card>
        </div>
    )
}