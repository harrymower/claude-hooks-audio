
0:00
Welcome back to another episode on how to get the Best out of
0:03
Claude code in today's video.
0:06
I'll be one second.
0:10
I Ah-huh.
0:12
So it seems that I've just gotten a notification from Claude that
0:14
it needs my permission before it's gonna be able to edit a file.
0:17
So I'm gonna do that right now.
0:19
Claude actually needs me to approve this plan that we have here.
0:22
So I'm just gonna do this and let me just hop back to where
0:24
I was earlier now, Ah.
0:28
I've got a notification on my desktop and I was also told by my
0:30
voice assistant that it was ready.
0:32
and true enough, if you head back into Claude quote right now, you can
0:34
see that the task has been completed.
0:36
Great.
0:37
I don't know about you, but this happens to me a lot.
0:39
I leave Claude Code running in the background, and then oftentimes
0:42
I'm doing something else.
0:43
and then I come back a couple of minutes later hoping that the task is completed
0:46
only to realize that it got stuck.
0:47
Asking for permission.
0:49
and yes, you can use dangerously skip permissions or you can add a lot of
0:53
these commands into your settings file.
0:55
but what about things like approving plans or simply letting you know that Claude is
0:58
now done with the task that you gave it.
1:00
so in today's tutorial, I'll be showing you how you can make use of Claude
1:02
code's hook system so that you will be able to get notifications both on
1:06
your desktop via audio, as well as on your phone via push notifications as
1:10
Claude is running through your task.
1:12
I think it's not only a very fun use case, but it's actually a very useful
1:15
way to actually understand how the hook system works within Claude code.
1:19
Now I also wanted to mention that everything you see in today's video,
1:21
including the source code, the audio files, the configuration files, as well
1:25
as the lesson plans are all available and you can access it in the description
1:29
below I've created a Claude Code Builder Pack And this contains everything that
1:32
you see in today's video, as well as all my previous videos together as well.
1:36
It is all in one place.
1:37
You don't have to worry about any GitHub access, and you'll be able to get off and
1:40
running and integrating everything that you see into your projects right away.
1:44
and without further ado, let me demonstrate more capabilities
1:46
of this system today.
System Demo
1:47
All right, so let's get started with today's demonstration.
1:50
I actually have a demo app over here, which you can see running on the sidebar.
1:55
This is just a sample of React app with an existing code base so that we have
1:59
something to run Claude Code against.
2:00
so let's start off with study the folder in and I'm gonna do apps,
2:05
video, idea bot, and let's get started
2:12
And as you can see, that's already the first notification that's come
2:14
through from the voice system.
2:16
it basically has been able to see that it's a readme
2:19
documentation file over there.
2:21
And the work was completed, I received a notification.
2:24
On my computer, and actually this notification has similarly
2:28
shown up on my phone as well.
2:30
now let's actually step back a bit here to see what has happened.
2:32
so what you see here that whenever Claude performs an action it
2:35
act and a hook event is actually fired for us to be able to handle.
2:38
If it matches something within our configuration file, he actually
2:41
allows us to perform a custom command.
2:43
So in this case, it plays a notification message where Alfred
2:46
tells us that's reading a file.
2:48
and one thing to quickly highlight here is that you've seen two systems at work.
Feature 1: Dual Event Handling
2:51
First of all, you heard the voice notification system in which It
2:55
was able to map these actions into something that plays back audio.
2:58
But then you also saw the other notification system here where I actually
3:02
received a desktop notification on my computer as well as on my phone.
3:05
And the architecture for this system is actually very similar.
3:08
So once you've done one, it's very easy to extend towards
3:11
building another kind of system.
Feature 2: Contextual Handling
3:13
now the other thing to point out here is that if you were paying attention
3:15
as you will see subsequently, it not only is able to say, oh, I'm reading
3:20
a file, but it's able to get context around what kind of file is being read,
3:23
which is why he actually mentioned that it was reading a Readme file.
3:26
Okay, So let's actually try the next thing now.
3:28
I'm gonna say that I don't like how the cars look, so let's try
3:32
to add a nice gradient towards it.
3:34
And I'm gonna make sure that I'm in plan mode.
3:36
So shift that so that it actually thinks about what it needs to do.
3:39
And then it will give me a plan.
3:41
So let's just drag this up here a little bit.
3:46
And so now it's gonna think about what it needs to.
3:53
alright.
3:53
And now you've seen something different, right?
3:55
you've seen this notification here as well as the voice notification
3:57
saying that it needs permission, and the reason for that is that.
4:00
There is actually a prom from Claude itself, in which I need to make a
4:04
decision about whether this plan is something that I want it to do.
4:07
So it's gonna add gradient to it, and then it's gonna have to update several
4:10
other, TypeScript and TSX files.
4:13
And so I'm gonna say yes and auto accept edits.
4:15
And this was just to demonstrate that the hooks has allowed us to
4:18
catch different types of events and handle them differently.
4:21
Previously it was just gonna play a sound.
4:23
This time it's actually gonna play a different kind of message,
4:25
asking me a question, that I actually need to take action.
4:30
and as, you hear now, it says that because it's a TypeScript file, it's saying it's
4:34
gonna begin the TypeScript modifications.
4:37
And now it's gonna update the to-do list because it is now performing a
4:40
different kind of event over here.
4:42
today,
4:45
Uhhuh, and here we go.
4:46
It's done, is doing the type touch, script modifications this time, and
4:51
then it's updating the todo list And now it's saying it's finished the
4:56
code update that you needed to do.
5:00
and it's updating the to-do list once again.
5:06
And there you have it.
5:07
The task is completed and we get a notification here.
5:09
and I'm gonna check my phone very quickly, I pull this up, I
5:11
can see all of the notifications coming onto my phone as well.
5:16
and so this is what we'll be showing you today, how the hook system can
5:19
be used to do something as simple as voice and push notifications.
5:23
now, using a notification system may not be the most complex or interesting case.
5:27
It is pretty fun.
5:28
But the main thing is that it gives you a good idea of how you
5:32
actually handle and deal with hooks within the Claude Code ecosystem.
5:36
And with that understanding and knowledge, you can then extend it to do other
5:39
things like type checking and preed hooks and anything else that will help
5:44
accelerate and make your workflow better.
5:47
Alright, so now let's dive into this in a little bit more detail so that you
5:50
can see how I got all of this set up.
5:52
everything you see in today's video.
5:54
has been made available, and you can access it in the links
5:57
in the description below.
5:58
And this includes several things.
6:00
It includes the demo app that you see right over here, so you have
6:02
something to play around with.
6:04
It includes the push notification system, as well as the voice activation system.
6:08
I've also included, full lesson plan and write up that you see over here.
6:11
It has the entire lesson plan, but more importantly, it also includes
6:15
diagrams such as this hook event flow.
6:17
this architecture diagram that we have over here, as well as the diagram showing
6:21
how the context aware system works.
6:23
You can access everything within the Insiders Club and you can gain access to
6:26
the GitHub repository containing this.
6:28
But if you would like to skip all of that and just get everything
6:31
related to this project file in one nice I'll highly recommend getting
6:35
my Claude code, build pack, which is available in the description below,
6:38
It not only includes everything for today's tutorial, but all of
6:41
my previous tutorials as well, including code configuration files,
6:45
custom commands, and cursor rules as well, and it's all nicely bundled up
6:49
Into a single pack so that you can easily get hold of it and then
6:52
extract it out into your project and everything will be ready to go.
6:55
Alright, without further ado, let's dive right back in.
6:58
All right guys.
6:59
Okay.
6:59
So for today's tutorial, it's going to be slightly different.
7:02
And the reason for that is that we won't spend as much time looking
7:06
at the code because the code itself is not super interesting and you
7:11
can easily generate the code, you know, by using Claude itself.
7:14
But I think the main thing to understand here is really
7:18
around what Claude hooks are
7:20
And thinking about the architecture in which you can utilize these hooks for
7:24
the purposes that you are looking for.
7:26
what we will be covering is how you can use Claude code hooks to create
7:29
two different notification systems.
7:31
One of them is going to be a voice notification system such that whenever
7:34
events happens within Claude code As it's executing various tasks, you get
7:38
voice notifications to know when progress is hitting on, but more importantly,
7:42
you will know when a task is waiting for your input or has completed,
7:45
which is extremely helpful when you are switching between tabs or maybe
7:48
you're checking out something else and leaving running in the background.
7:51
The second system that we'll be doing is actually a push notification system.
7:55
Such that whenever events happen, you actually get event notifications
7:59
onto your phone as well.
8:00
And this again, is extremely useful because if you're like me, sometimes,
8:03
you know, sometimes I have my headphones out or my audio's not playing.
8:06
But I definitely can see whenever notifications appear on my phone,
8:10
So combined together, they cover both the visual as well as the
8:13
audio way of notifying you as Claude Code gets through its task.
8:18
Now the main takeaway from today's system are two key things.
8:22
Number one, you'll be able to take this architecture to deeply
8:25
understand how hooks work within Claude Code and then extend it for
8:28
any other system that you have.
8:30
Now the second thing here that you will see is that I've actually
8:33
extended the handling of hooks to have context aware intelligence.
8:37
So rather than saying is being read.
8:39
It will be able to say, Hey, a Python file is being read, or
8:42
the markdown file is being read.
8:44
and you'll also be able to handle different actions so it knows where
8:46
it's running a git command versus doing a file read or performing
8:50
some other action as well.
8:51
this is extremely useful because you'll be able to get
8:53
variations in the voice narration.
8:55
But the other thing is that it provides you a much finer green way
8:58
for you to decide which things you're interested in and which things you're
9:01
not interested in to be notified about.
Understanding Hooks
9:03
now, before we get going, it's really important to get a high level
9:06
understanding of what Claude hooks are
9:08
now the Claude documentation is actually really good And I would advise anybody
9:11
who's working with Claude Hooks to at least scan the first couple of sections
9:15
within this to understand how things work.
9:17
the main thing to take away is that There are several main hook events that
9:21
you can listen to, and these will tie into the actions that Claude are taking.
9:26
so for example, there's this thing called the preto use event.
9:29
And this fires off Prior to Claude actually using a
9:32
tool to perform an action.
9:34
So for example, if you use a Preto use event against a file edit or a file read,
9:38
you will be able to capture this event and perform an action before the file
9:42
edit or the file right is happening.
9:44
So very useful use cases for this is that If you wanna prevent rights or add this
9:47
to particular files or particular folders, you'll be able to do it within there.
9:50
And so just scrolling down, you will see there's a postal use which effectively is
9:55
happening after the event has occurred.
9:57
So you can do things like formatting linting or spell
10:00
checking if you really want to.
10:01
Now, rather than going through all of the events here today, I'm gonna focus your
10:04
attention on just two more, which is the notification event and the stop event.
10:09
The stop event happens whenever Claude is done with a task.
10:11
And the very useful use case here is that whenever it's done with a task, it sends
10:15
you the notification saying it's done.
10:17
the notification event is quite similar, but it provides you with
10:21
a little bit more context over why Claude has paused in its flow.
10:25
So, for example, it needs a permission to run a certain command or to edit
10:28
a certain file, and that's when notification events come through.
10:31
So while you can, definitely take a look through the other events that you
10:33
handle, I always believe that the easiest way to understand these things is not
10:36
by just perusing the documentation, but to actually get down and implementing
10:39
something within code itself.
10:41
I've simplified this in the easiest way possible.
10:43
Whenever Claude performs an action, a hook event gets fired So whenever Clark
10:47
wants to perform an action, for example, editing a file, A hook event is fired.
10:51
So in the case here, this will fire off before the edit is made And
10:55
the way that you handle this events is specify within a confi file,
10:58
which I'll show you very shortly.
11:00
But once it matches the event, you get to specify what action to take.
11:04
So in this case, I want to play a notification sound.
11:07
and here's a very quick structure of how the configuration file looks.
11:10
So you decide what event you want to listen for, what tool it matches, and
11:14
then what command you want to run.
11:16
But like I said, the easiest way to understand this is always
11:18
by looking at actual examples.
11:20
So let's actually take a look at what I have configured here today.
11:22
so within my dot Claude folder, you will see that I have a setting star Jason file.
11:27
Within the settings Jason file, this is exactly where I specified
11:31
how I want to handle my hooks.
11:32
so you can see in my hook section here, I'm going to hook onto
11:36
the stop events, the pre tool use and the notification events.
11:40
Alright?
11:40
and within that I have two handlers.
11:42
One for voice notifications.
11:44
And one for push notifications.
11:46
In the case of pre-cool use, I only want voice notifications for this because
11:49
I don't want to be receiving push notifications for every single tool use
11:52
that is happening within Claude code.
11:54
However, when Claude is done, so when it's stopped or when there's
11:57
a need for user intervention, I actually want this to happen for both.
12:01
Now, this is my personal preference.
12:02
Obviously, if you want to receive push notifications for every single event that
12:06
Claude is running, feel free to do so.
12:08
Alright?
12:09
so that's the structure here And the next thing to highlight here is that
12:12
you can see that for each system, I have a single Python file that's handling
12:18
everything to do with the hook, and it's the same Python file across the
12:22
different hooks that we have here.
12:24
Now, there's a lot of debate I've seen people do things many different ways.
12:27
You can have a specific handler for each of these hooks.
12:29
So for example, a stop handler, a pre two use handler, or a notification handler.
12:33
And you can even have specific handlers for specific hooks, for specific matches.
12:37
however, just looking through various different examples, tutorials and my own
12:41
experience, I found that having a single file for a single system is a lot simpler.
12:46
and there are several reasons why that will become clear.
12:48
but let me just demonstrate this to you a little bit more.
12:50
So.
12:50
here's the architecture of our system today.
12:52
Claude code will be running, and then there will be several hook
12:55
events that will be firing off every time clo, takes an action.
12:59
I have two different handlers, one for the voice notifications
13:02
and one for push notifications.
13:05
and just with a single handler, it allows me to handle Every single
13:08
combination of events that comes through.
13:10
you can see that the systems are actually very similar in structure
13:13
with a single Python file.
13:14
There is a mapping json file, whether it maps the event to a sound to be
13:19
played or a notification to be sent, And then from there, it just provides
13:22
the audio feedback or the notification that's required, So let's take a
System 1: Voice Notifications
13:25
look at voice notifications first.
13:27
So within my Claude folder, I go to hooks, and you can see I
13:30
have push and voice notification.
13:32
I'm gonna open up voice notifications and you will see that I have a single
13:35
handler PY file as well as this sound mapping js pulling this up.
13:40
You can see how this works.
13:42
It maps the various different hook events, whether it's a stop, a notification.
13:46
Or pre tool use against sound files to be played.
13:49
And if there's more than one file that's specified here, it means that
13:53
it will randomly switch between them.
13:54
And this provides some nice variation so that you don't hear the same
13:58
command happening every single time.
14:00
And the other thing that we have here is that it maps not just to events,
14:04
but to the tools that are being used.
14:05
So for example, if it's editing something, it will map to code edit, If it's mapping
14:10
to a grab tool, It will map to the search audio and to take things a step further,
14:15
if a retool is happening on a particular file extension, it will provide an even
14:19
more specific voice activation here.
14:21
So for example, if it's reading a Python file, it will choose between
14:24
this audio file or this audio file.
14:26
And that's checking it by extension.
14:28
However, There may be specific files like the README file that you want it
14:31
to say something much more specific,
14:33
And now you can do it by extension, by specific file names, which
14:36
gives you even more flexibility to provide different voices for
14:39
different files within your system.
14:41
And if you actually, jump back into the settings, Jason file here, you will
14:44
see that the handler that I have also allows you to specify which voice that
14:49
you want to use and as the demonstration has shown, I actually have folder that's
14:54
inspired from Alfred, from Batman,
14:56
And I have all the files here that play back the audio in his voice.
14:59
and subsequently what you could do here is that you could then create a new
15:03
folder and call it, say maybe Jarvis from Ironman and then swap this out to Jarvis.
15:08
and then you can put in all the audio that relates to Jarvis's voice.
15:11
Over here, and then it will automatically switch for you.
15:14
so hopefully this highlights why I've architected it in
15:16
this way and how to use it.
System 2: Push Notifications
15:22
just jumping back into this diagram over here, I've just shown you
15:25
how the system works and the other system that I'm gonna show you here
15:28
is actually the push notifications.
15:30
I'm gonna Claudee off the voice notifications and
15:32
open up proof notifications.
15:33
And you can see it's almost exactly the same.
15:35
You have a single handler file and you have a single notification mapping
15:39
file, and in this case it's very similar, but in state of mapping to
15:42
particular voices, it actually maps to the title of the notification
15:46
as well as the message to send.
15:48
So you can see very similar structure.
15:50
You have the stop event notification events, as well as the preto use events.
15:55
you have specific tools in which you want it to display different messages.
15:58
you have contextual patterns based on the file operations that are happening,
16:01
as well as the extensions or the filing.
16:03
so very similar structure yet lots of flexibility and results in a very
16:08
dynamic dual notification system that I've demonstrated here today.
handler.py
16:12
so at this stage, I'm hoping that you've understood what hooks
16:14
are how you can easily handle them with a single Python file.
16:18
to do quite creative and complex kind of behavior within Claude code.
16:21
now, one very important thing to highlight about the Python file
16:23
is that you may be wondering,
16:24
How do I deal with external dependencies?
16:26
For example, if I need to use the http x library or if I
16:29
need to use some sound library?
16:31
the way that we overcome this is by using something called uv.
16:35
jumping back into my setting.
16:36
Do Jason file.
16:37
You will see I'm not running things with Python, followed by the script name.
16:40
I'm actually using UV run, followed by the script name.
16:43
and this is a great time to show you what UV is.
16:46
UV is a Python package.
16:48
Which is extremely fast.
16:49
But the most important thing it allows you to execute scripts within
16:52
an isolated environment in one shot.
16:55
And the way that you do so is not by using a requirements TXT file or a
16:58
PI project, do two ml file instead.
17:01
You actually specify everything within the Python file itself.
17:04
So let me show you how this works.
17:05
so if I go to my handler for push notifications.
17:08
You can see at the top of the file specifies the Python version that is
17:12
required, which is three point 13, as well as the http x dependency.
17:17
and so when you run UV against this file, it will actually spin up a
17:21
virtual environment that contains this dependency with this version of
17:24
Python, before executing the file.
17:26
so you don't have to worry about whether you have the dependencies running on
17:28
your local machine, or whether you have the right Python because this
17:31
is all handled automatically for you.
17:33
So jumping back into the voice notifications one,
17:35
you can see the same thing.
17:37
If I go to handler, you can see that I specified three point 13 and
17:40
the dependencies here is Pie Game.
17:42
now you might be wondering why am I specifying a full fledged
17:44
Python game library here?
17:46
the reason is very simple.
17:47
I was trying to get sound to play across various different machines,
17:50
windows, Linux, as well as Mac.
17:52
and there's lots of ways to actually use native capabilities within each of
17:56
these operating systems to play sound.
17:58
However, I just could not get it to work reliably when I was switching
18:01
between Windows, WSL as well as Mac.
18:03
so I decided to ask Claude, and Clark came up with using Pie Game,
18:06
which has an audio library within.
18:08
I'm pretty sure we can actually swap this out with a pure audio playing library, but
18:12
for expediency and it kind of just worked for me, so I just put it in this way.
18:16
But if you know an alternative Python library that will allow me to play
18:19
audio easily, let me know and we should probably swap this out as well.
ntfy.sh
18:24
Alright, so the next thing to mention here is how am I handling push notifications?
18:29
I'm using something called notified or as hitch.
18:31
it's honestly so simple and so powerful to get going.
18:33
however, people who are new to it might get a little bit
18:35
confused about what's going on.
18:37
So I wanted to just take this opportunity to explain what's going on here now.
18:41
now the first thing to know about Notify.
18:42
is that you effectively send messages against a topic name, and then you
18:46
can choose to subscribe to that topic name and if you subscribe
18:48
to that topic name on your device,
18:50
You'll receive that exact message and the default behavior for notify is public.
18:54
so jumping into settings, do, Jason, you can see here that for my push
18:57
notifications, I am subscribing to this specific topic over here.
19:02
so if I copy this and just paste it at the end of it, you can see it it's
19:06
actually showing me all the notifications that have been sent from Clark Code.
19:09
now, the thing to realize is that all of this is public.
19:12
So the reason why I've added a random hash behind it is
19:14
It's just reduces the chance of somebody stumbling across it,
19:17
especially when I'm testing.
19:18
for example, if you go to something like Claude Code notifications over
19:21
here, you can actually see events being published by other people who
19:25
are using the exact same endpoint.
19:26
so, if you use something as generic as Claude code notifications over
19:29
here, you will find that there are other people who may be publishing to
19:32
this exact same notification topic.
19:34
so if you start subscribing to these notifications on your phone
19:37
or your computer, you're going to start getting these alerts as well.
19:40
so that's the reason why I added a random hash behind it.
19:42
and there's very little chance that somebody will publish to it,
19:44
and it's just great for testing,
19:46
So if you actually look at the code here in the Send push notification.
19:49
function.
19:50
All it does is just takes in the topic and title, the topic that
19:53
we pass in, the title and message, and then it sends it to the server.
19:56
And there's other things that you can set such as text and priority, but by
20:00
default, we just set some defaults here.
20:02
and all it does is that it just sends the notification with the correct
20:04
headers using the http X client library.
20:08
And that's pretty much it.
20:08
And on the phone You just have to download the app add what
20:11
topic you want to subscribe to.
20:12
In this case,
20:13
I'm gonna use the same one that I specified over here.
20:15
and once you add it in, you're going to continue to get push
20:18
notifications related to that.
20:20
So basically that's the entire system over here.
20:21
It's actually very straightforward, but yet extremely powerful.
20:25
here's just an additional diagram to help to solidify the concept.
20:27
Over here, we get a hook event.
20:29
our system is able to check the tool type and then do a secondary filter to provide
20:33
more context around what is happening.
20:35
And from there it will either check what variation to use or
20:38
what push notification to send.
20:40
Now, like I said, the main thing around here is just understanding the concept
20:43
of hooks and how you can handle them.
20:45
And you can just take this system that we have over here and integrate
20:48
it within your workflow to do other creative and fun stuff.
20:51
So that's it for this demonstration and this tutorial.
20:53
I didn't go into the code specifics this time because it's not as
20:55
interesting as understanding the high level concepts related to
20:59
hooks and how you can handle them.
How to get this project
21:00
I've made this entire project available.
21:02
including the settings configuration, as well as the two different voice and
21:06
push notification system handlers, as well as all the audio files available.
21:10
I've also included the entire lesson plan, with all the diagrams
21:13
that you've seen here today.
21:14
You can get hold of everything by clicking the link to the builder
21:17
pack in the description below.
21:18
the builder pack actually contains all the code scripts and configuration files
21:22
for my previous three episodes as well.
21:24
You can also access a version of this for free as part of my AI
21:28
oriented Insiders Club and the link is also in the description below.
Conclusion
21:32
Alright.
21:32
I really hope you enjoyed today's tutorial.
21:33
Do let me know in the comments what you think, If you haven't checked
21:36
out this other video about how you can use Claude code, combine it with
21:40
any model and provide out there for reduced costs and blazing fast speeds,
21:44
You definitely don't want to miss that one.
21:46
Don't forget to give this video a like, hit that subscribe button and turn on
21:49
notifications so that you'll always be the first to know whenever content drops.
21:53
I really hope this has been helpful and I'll see you next time.

