from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import (Base, Resource, Post, User, UserRole, CounselorStatus, Booking, Feedback, 
                   Newsletter, CounselorReport, MoodEntry, ForumPost, ForumReply, Assessment)
from datetime import datetime, timedelta
import json

def create_seed_data():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(ForumReply).delete()
        db.query(ForumPost).delete()
        db.query(CounselorReport).delete()
        db.query(Newsletter).delete()
        db.query(MoodEntry).delete()
        db.query(Assessment).delete()
        db.query(Feedback).delete()
        db.query(Booking).delete()
        db.query(Post).delete()
        db.query(Resource).delete()
        db.query(User).delete()
        db.commit()
        
        # Seed admin user
        admin_user = User(
            firebase_uid="admin_seed_uid",
            email="admin@mello.com",
            name="System Administrator",
            role=UserRole.ADMIN
        )
        db.add(admin_user)
        
        # Seed counselors
        counselors = [
            User(
                firebase_uid="counselor_1_uid",
                name="Dr. Priya Sharma",
                email="priya.sharma@mello.com",
                role=UserRole.COUNSELOR,
                specialization="anxiety",
                license_number="PSY12345",
                phone_number="+91-9876543210",
                address="Mumbai, Maharashtra",
                counselor_status=CounselorStatus.APPROVED
            ),
            User(
                firebase_uid="counselor_2_uid",
                name="Dr. Rajesh Kumar",
                email="rajesh.kumar@mello.com",
                role=UserRole.COUNSELOR,
                specialization="academic",
                license_number="PSY67890",
                phone_number="+91-9876543211",
                address="Delhi, India",
                counselor_status=CounselorStatus.APPROVED
            ),
            User(
                firebase_uid="counselor_3_uid",
                name="Dr. Anita Patel",
                email="anita.patel@mello.com",
                role=UserRole.COUNSELOR,
                specialization="depression",
                license_number="PSY11111",
                phone_number="+91-9876543212",
                address="Bangalore, Karnataka",
                counselor_status=CounselorStatus.APPROVED
            )
        ]
        
        for counselor in counselors:
            db.add(counselor)
        
        # Seed sample users
        sample_users = [
            User(
                firebase_uid="user_1_uid",
                name="Arjun Singh",
                email="arjun@example.com",
                role=UserRole.USER,
                age=20,
                university="IIT Delhi",
                preferred_language="en"
            ),
            User(
                firebase_uid="user_2_uid",
                name="Priya Mehta",
                email="priya@example.com",
                role=UserRole.USER,
                age=19,
                university="Mumbai University",
                preferred_language="hi"
            )
        ]
        
        for user in sample_users:
            db.add(user)
        
        # Commit users first to get IDs
        db.commit()
        
        # Create sample feedback with new fields
        feedback_entries = [
            Feedback(
                user_id=sample_users[0].id,
                counselor_id=counselors[0].id,
                feedback_type="counselor",
                rating=5,
                feedback_text="Very helpful session, felt much better afterwards",
                helpful_aspects=json.dumps(["Active listening", "Practical advice", "Empathetic approach"]),
                improvement_suggestions=json.dumps([]),
                would_recommend=True,
                session_date=datetime.now() - timedelta(days=1)
            ),
            Feedback(
                user_id=sample_users[1].id,
                counselor_id=counselors[1].id,
                feedback_type="counselor",
                rating=4,
                feedback_text="Good advice, would recommend to others",
                helpful_aspects=json.dumps(["Professional knowledge", "Patient approach"]),
                improvement_suggestions=json.dumps(["More time for discussion"]),
                would_recommend=True,
                session_date=datetime.now() - timedelta(days=2)
            )
        ]
        
        for feedback in feedback_entries:
            db.add(feedback)
        
        # Create sample bookings
        bookings = [
            Booking(
                user_id=sample_users[0].id,
                counselor_id=counselors[0].id,
                preferred_datetime=datetime.now() + timedelta(days=1),
                issue_description="Feeling anxious about exams",
                urgency="high",
                status="confirmed"
            ),
            Booking(
                user_id=sample_users[1].id,
                counselor_id=counselors[1].id,
                preferred_datetime=datetime.now() + timedelta(days=2),
                issue_description="Need help with stress management",
                urgency="medium",
                status="pending"
            ),
            Booking(
                user_id=sample_users[0].id,
                counselor_id=counselors[0].id,
                preferred_datetime=datetime.now() + timedelta(days=3),
                issue_description="Relationship issues",
                urgency="medium",
                status="completed"
            )
        ]
        
        for booking in bookings:
            db.add(booking)
        
        # Seed resources
        resources = [
            # Meditation and Wellness Guides
            Resource(
                title="Guided Meditations - Tara Brach",
                type="audio",
                language="en",
                url="https://www.tarabrach.com/guided-meditations/",
                description="Comprehensive collection of guided meditations for mindfulness, compassion, and healing.",
                category="mindfulness",
                duration="Various",
                uploaded_by=admin_user.id
            ),
            Resource(
                title="UCLA Mindful Meditations",
                type="audio",
                language="en",
                url="https://www.uclahealth.org/uclamindful/guided-meditations",
                description="Free guided meditations from UCLA's Mindful Awareness Research Center.",
                category="mindfulness",
                duration="3-19 min",
                uploaded_by=admin_user.id
            ),
            Resource(
                title="Insight Timer - Meditation App",
                type="video",
                language="en",
                url="https://insighttimer.com/",
                description="World's largest library of free guided meditations and mindfulness content.",
                category="mindfulness",
                duration="Various",
                uploaded_by=admin_user.id
            ),
            Resource(
                title="Mindfulness Audio Videos - UCSD",
                type="video",
                language="en",
                url="https://cih.ucsd.edu/mindfulness/guided-audio-video",
                description="Guided mindfulness practices from UC San Diego's Center for Integrative Health.",
                category="mindfulness",
                duration="10-45 min",
                uploaded_by=admin_user.id
            ),
            Resource(
                title="Free Guided Meditations - Meditate Happier",
                type="audio",
                language="en",
                url="https://meditatehappier.com/meditations/freeguidedmeditations",
                description="Collection of free guided meditations for stress relief and mental clarity.",
                category="stress",
                duration="5-30 min",
                uploaded_by=admin_user.id
            ),
            Resource(
                title="YSSOFINDIA Guided Meditations",
                type="audio",
                language="hi",
                url="https://yssofindia.org/meditation/guided-meditations",
                description="Guided meditation practices in Hindi for inner peace and spiritual growth.",
                category="mindfulness",
                duration="15-45 min",
                uploaded_by=admin_user.id
            ),
            Resource(
                title="Isha Kriya Meditation Program",
                type="video",
                language="en",
                url="https://isha.sadhguru.org/ca/en/yoga-meditation/yoga-program-for-beginners/isha-kriya-meditation",
                description="Simple yet powerful meditation technique for beginners by Sadhguru.",
                category="mindfulness",
                duration="12-18 min",
                uploaded_by=admin_user.id
            ),
            Resource(
                title="Free the Mind - Hindi Breathing Exercises",
                type="video",
                language="hi",
                url="https://www.breathingroom.com/videos/free-the-mind-hindi",
                description="Breathing exercises and meditation techniques in Hindi for mental wellness.",
                category="stress",
                duration="10-20 min",
                uploaded_by=admin_user.id
            ),
            Resource(
                title="iDANIM Meditation Platform",
                type="video",
                language="en",
                url="https://www.idanim.com/",
                description="Indian meditation app with guided sessions for stress, anxiety, and sleep.",
                category="mindfulness",
                duration="5-60 min",
                uploaded_by=admin_user.id
            ),
            Resource(
                title="Art of Living Online Guided Meditation",
                type="video",
                language="en",
                url="https://www.artofliving.org/in-en/meditation/guided/online-guided-meditation",
                description="Online guided meditation sessions from Art of Living foundation.",
                category="mindfulness",
                duration="20-40 min",
                uploaded_by=admin_user.id
            ),
            Resource(
                title="Headspace for Students",
                type="video",
                language="en",
                url="https://www.headspace.com/students",
                description="Student-focused meditation and mindfulness exercises for academic stress.",
                category="stress",
                duration="3-20 min",
                uploaded_by=admin_user.id
            ),
            Resource(
                title="Calm App - Daily Meditation",
                type="audio",
                language="en",
                url="https://www.calm.com/meditate",
                description="Daily meditation sessions for anxiety, sleep, and focus improvement.",
                category="anxiety",
                duration="10-25 min",
                uploaded_by=admin_user.id
            )
        ]
        
        for resource in resources:
            db.add(resource)
        
        # Seed forum posts
        posts = [
            Post(
                user_id=sample_users[0].id,
                alias="StudyStressed22",
                content="Anyone else feeling overwhelmed with semester exams? I can't seem to focus and keep procrastinating. Any tips that actually work?",
                category="stress",
                moderated=True,
                moderated_by=admin_user.id,
                likes=15,
                timestamp=datetime.now()
            ),
            Post(
                user_id=sample_users[1].id,
                alias="NightOwl_Student",
                content="I've been having trouble sleeping before important exams. My mind just keeps racing with all the things I need to study. How do you all manage to get good sleep during exam season?",
                category="sleep",
                moderated=True,
                moderated_by=admin_user.id,
                likes=23,
                timestamp=datetime.now()
            ),
            Post(
                user_id=sample_users[0].id,
                alias="AnxiousLearner",
                content="Does anyone else get panic attacks during exams? Even when I know the material, I just freeze up. It's affecting my grades and I don't know what to do.",
                category="anxiety",
                moderated=True,
                moderated_by=admin_user.id,
                likes=31,
                timestamp=datetime.now()
            ),
            Post(
                user_id=sample_users[1].id,
                alias="MotivationSeeker",
                content="Feeling really down lately. College feels so competitive and I don't think I'm good enough. How do you stay motivated when everything feels pointless?",
                category="depression",
                moderated=True,
                moderated_by=admin_user.id,
                likes=18,
                timestamp=datetime.now()
            ),
            Post(
                user_id=sample_users[0].id,
                alias="BalanceSeeker",
                content="Struggling to balance academics, part-time job, and social life. I feel like I'm failing at everything. Any advice on time management and setting priorities?",
                category="academic",
                moderated=True,
                moderated_by=admin_user.id,
                likes=27,
                timestamp=datetime.now()
            ),
            Post(
                user_id=sample_users[1].id,
                alias="SociallyAwkward",
                content="Making friends in college is harder than I thought. I'm pretty introverted and social situations make me anxious. Anyone else dealing with this?",
                category="social",
                moderated=True,
                moderated_by=admin_user.id,
                likes=19,
                timestamp=datetime.now()
            )
        ]
        
        for post in posts:
            db.add(post)
        
        # Create sample newsletters
        newsletters = [
            Newsletter(
                title="Managing Academic Stress: A Student's Guide",
                content="Academic stress is a common experience for college students. Here are some effective strategies to manage it...",
                author_id=admin_user.id,
                is_published=True,
                published_at=datetime.now() - timedelta(days=7)
            ),
            Newsletter(
                title="The Importance of Sleep for Mental Health",
                content="Quality sleep is crucial for mental well-being. This newsletter explores the connection between sleep and mental health...",
                author_id=admin_user.id,
                is_published=True,
                published_at=datetime.now() - timedelta(days=14)
            ),
            Newsletter(
                title="Building Resilience in College",
                content="Resilience is the ability to bounce back from challenges. Learn how to develop this important skill...",
                author_id=admin_user.id,
                is_published=True,
                published_at=datetime.now() - timedelta(days=21)
            )
        ]
        
        for newsletter in newsletters:
            db.add(newsletter)
        
        # Create sample mood entries
        mood_entries = [
            MoodEntry(
                user_id=sample_users[0].id,
                mood_score=7,
                energy_level=6,
                stress_level=4,
                sleep_hours=7.5,
                notes="Feeling good today, got enough sleep",
                date=datetime.now() - timedelta(days=1)
            ),
            MoodEntry(
                user_id=sample_users[0].id,
                mood_score=5,
                energy_level=4,
                stress_level=7,
                sleep_hours=5.0,
                notes="Stressed about upcoming exam",
                date=datetime.now() - timedelta(days=2)
            ),
            MoodEntry(
                user_id=sample_users[1].id,
                mood_score=8,
                energy_level=8,
                stress_level=3,
                sleep_hours=8.0,
                notes="Great day, feeling motivated",
                date=datetime.now() - timedelta(days=1)
            )
        ]
        
        for mood_entry in mood_entries:
            db.add(mood_entry)
        
        # Create sample assessments
        assessments = [
            Assessment(
                user_id=sample_users[0].id,
                assessment_type="Depression Scale",
                responses=json.dumps({"q1": 2, "q2": 1, "q3": 3, "q4": 2}),
                total_score=12,
                severity_level="Mild",
                recommendations="Consider counseling sessions",
                completed_at=datetime.now() - timedelta(days=3)
            ),
            Assessment(
                user_id=sample_users[1].id,
                assessment_type="Anxiety Inventory",
                responses=json.dumps({"q1": 3, "q2": 4, "q3": 3, "q4": 2}),
                total_score=28,
                severity_level="Moderate",
                recommendations="Regular therapy recommended",
                completed_at=datetime.now() - timedelta(days=5)
            )
        ]
        
        for assessment in assessments:
            db.add(assessment)
        
        # Create sample counselor reports
        counselor_reports = [
            CounselorReport(
                counselor_id=counselors[0].id,
                patient_id=sample_users[0].id,
                title="Monthly Progress Report - Arjun Singh",
                report_type="patient_progress",
                content="Patient has shown significant improvement in managing anxiety symptoms. Regular attendance and active participation in sessions.",
                recommendations="Continue current therapy approach. Consider introducing group therapy sessions.",
                priority="medium",
                status="submitted",
                session_date=datetime.now() - timedelta(days=1),
                submitted_at=datetime.now() - timedelta(hours=2)
            ),
            CounselorReport(
                counselor_id=counselors[1].id,
                patient_id=sample_users[1].id,
                title="Assessment Summary - Priya Mehta",
                report_type="assessment",
                content="Initial assessment completed. Patient presents with mild depression and academic stress.",
                recommendations="Begin cognitive behavioral therapy. Schedule weekly sessions for first month.",
                priority="medium",
                status="draft",
                session_date=datetime.now() - timedelta(days=3)
            )
        ]
        
        for report in counselor_reports:
            db.add(report)
        
        # Create sample forum posts with new structure
        forum_posts = [
            ForumPost(
                user_id=sample_users[0].id,
                title="Dealing with exam stress",
                content="Anyone else feeling overwhelmed with semester exams? I can't seem to focus and keep procrastinating. Any tips that actually work?",
                category="academic_stress",
                is_anonymous=True,
                is_flagged=False,
                is_moderated=True,
                moderated_by=admin_user.id,
                moderation_action="approved",
                reply_count=5,
                like_count=15
            ),
            ForumPost(
                user_id=sample_users[1].id,
                title="Sleep issues before exams",
                content="I've been having trouble sleeping before important exams. My mind just keeps racing with all the things I need to study.",
                category="sleep_issues",
                is_anonymous=True,
                is_flagged=False,
                is_moderated=True,
                moderated_by=admin_user.id,
                moderation_action="approved",
                reply_count=8,
                like_count=23
            )
        ]
        
        for forum_post in forum_posts:
            db.add(forum_post)
        
        db.commit()
        
        # Create sample forum replies
        forum_replies = [
            ForumReply(
                post_id=forum_posts[0].id,
                user_id=sample_users[1].id,
                content="I use the Pomodoro technique - 25 minutes focused study, 5 minute break. Really helps with procrastination!",
                is_anonymous=True,
                like_count=8
            ),
            ForumReply(
                post_id=forum_posts[1].id,
                user_id=sample_users[0].id,
                content="Try meditation apps before bed. I use Headspace and it really helps calm my racing thoughts.",
                is_anonymous=True,
                like_count=12
            )
        ]
        
        for reply in forum_replies:
            db.add(reply)
        
        db.commit()
        print("Seed data created successfully!")
        
    except Exception as e:
        print(f"Error creating seed data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_seed_data()
