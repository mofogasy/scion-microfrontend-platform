import { Beans, MessageClient, MessageHeaders, takeUntilUnsubscribe, TopicMessage } from '@scion/microfrontend-platform';
import { Subject } from 'rxjs';

{
  // tag::publish[]
  const topic: string = 'myhome/livingroom/temperature'; // <1>
  const payload: any = '22 °C';

  Beans.get(MessageClient).publish(topic, payload); // <2>
  // end::publish[]
}

{
  // tag::subscribe[]
  const topic: string = 'myhome/livingroom/temperature'; // <1>

  Beans.get(MessageClient).onMessage$(topic).subscribe((message: TopicMessage) => {
    console.log(message.body); // <2>
  });
  // end::subscribe[]
}

{
  // tag::subscribe-with-wildcard-segments[]
  const topic: string = 'myhome/:room/temperature'; // <1>

  Beans.get(MessageClient).onMessage$(topic).subscribe((message: TopicMessage) => {
    console.log(message.params); // <2>
  });
  // end::subscribe-with-wildcard-segments[]
}

{
  // tag::publish-retained-message[]
  const topic: string = 'myhome/livingroom/temperature';
  const payload: any = '22 °C';

  Beans.get(MessageClient).publish(topic, payload, {retain: true}); // <1>
  // end::publish-retained-message[]
}

{
  // tag::publish-message-with-headers[]
  const topic: string = 'myhome/livingroom/temperature';
  const payload: any = '22 °C';
  const headers = new Map().set('sensor-type', 'analog'); // <1>

  Beans.get(MessageClient).publish(topic, payload, {headers: headers});
  // end::publish-message-with-headers[]
}

{
  // tag::receive-message-with-headers[]
  const topic: string = 'myhome/livingroom/temperature';

  Beans.get(MessageClient).onMessage$(topic).subscribe((message: TopicMessage) => {
    console.log(message.headers); // <1>
  });
  // end::receive-message-with-headers[]
}

{
  // tag::request[]
  const topic: string = 'myhome/livingroom/temperature';

  Beans.get(MessageClient).request$(topic).subscribe(reply => {  // <1>
    console.log(reply.body); // <2>
  });
  // end::request[]
}

{
  const sensor$ = new Subject<number>();

  // tag::reply[]
  const topic: string = 'myhome/livingroom/temperature';

  Beans.get(MessageClient).onMessage$(topic).subscribe((request: TopicMessage) => {
    const replyTo = request.headers.get(MessageHeaders.ReplyTo); // <1>
    sensor$
      .pipe(takeUntilUnsubscribe(replyTo)) // <3>
      .subscribe(temperature => {
        Beans.get(MessageClient).publish(replyTo, `${temperature} °C`); // <2>
      });
  });
  // end::reply[]
}
