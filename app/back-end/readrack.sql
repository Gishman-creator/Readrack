PGDMP      !            	    |            readrack    17.0    17.0 0    <           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            =           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            >           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            ?           1262    16386    readrack    DATABASE     |   CREATE DATABASE readrack WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_Rwanda.1252';
    DROP DATABASE readrack;
                     postgres    false            �            1255    16402    update_timestamp()    FUNCTION     �   CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;
 )   DROP FUNCTION public.update_timestamp();
       public               postgres    false            �            1259    16421    admin    TABLE     )  CREATE TABLE public.admin (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    firstname character varying(255) NOT NULL,
    lastname character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    refresh_token text,
    verification_code character varying(6) DEFAULT NULL::character varying,
    role character varying(20) DEFAULT 'admin'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.admin;
       public         heap r       postgres    false            �            1259    16420    admin_id_seq    SEQUENCE     �   CREATE SEQUENCE public.admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.admin_id_seq;
       public               postgres    false    218            @           0    0    admin_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.admin_id_seq OWNED BY public.admin.id;
          public               postgres    false    217            �            1259    16446    authors    TABLE       CREATE TABLE public.authors (
    id character varying(255) NOT NULL,
    image character varying(255),
    "authorName" character varying(255) NOT NULL,
    nickname character varying(255),
    dob date,
    nationality character varying(255),
    biography text,
    x character varying(255),
    facebook character varying(255),
    instagram character varying(255),
    website text,
    genres character varying(255),
    awards text,
    "searchCount" integer DEFAULT 0,
    dod date,
    "customDob" character varying(255)
);
    DROP TABLE public.authors;
       public         heap r       postgres    false            �            1259    16485    books    TABLE       CREATE TABLE public.books (
    id integer NOT NULL,
    image character varying(255) DEFAULT NULL::character varying,
    "bookName" character varying(255) NOT NULL,
    serie_id integer,
    author_id character varying(255) DEFAULT NULL::character varying,
    genres character varying(255) DEFAULT NULL::character varying,
    "publishDate" date,
    link text,
    "searchCount" integer DEFAULT 0,
    collection_id integer,
    "customDate" character varying(255) DEFAULT NULL::character varying,
    "serieIndex" integer DEFAULT 0
);
    DROP TABLE public.books;
       public         heap r       postgres    false            �            1259    16484    books_id_seq    SEQUENCE     �   CREATE SEQUENCE public.books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.books_id_seq;
       public               postgres    false    225            A           0    0    books_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.books_id_seq OWNED BY public.books.id;
          public               postgres    false    224            �            1259    16472    collections    TABLE     r  CREATE TABLE public.collections (
    id integer NOT NULL,
    image character varying(255) DEFAULT NULL::character varying,
    "collectionName" character varying(255) NOT NULL,
    author_id character varying(255) DEFAULT NULL::character varying,
    genres character varying(255) DEFAULT NULL::character varying,
    link text,
    "searchCount" integer DEFAULT 0
);
    DROP TABLE public.collections;
       public         heap r       postgres    false            �            1259    16471    collections_id_seq    SEQUENCE     �   CREATE SEQUENCE public.collections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.collections_id_seq;
       public               postgres    false    223            B           0    0    collections_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.collections_id_seq OWNED BY public.collections.id;
          public               postgres    false    222            �            1259    16457    series    TABLE     �  CREATE TABLE public.series (
    id integer NOT NULL,
    image character varying(255) DEFAULT NULL::character varying,
    "serieName" character varying(255) NOT NULL,
    author_id character varying(255) DEFAULT NULL::character varying,
    "numBooks" integer,
    genres character varying(255) DEFAULT NULL::character varying,
    link text,
    "searchCount" integer DEFAULT 0,
    related_collections text
);
    DROP TABLE public.series;
       public         heap r       postgres    false            �            1259    16456    series_id_seq    SEQUENCE     �   CREATE SEQUENCE public.series_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.series_id_seq;
       public               postgres    false    221            C           0    0    series_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.series_id_seq OWNED BY public.series.id;
          public               postgres    false    220            �            1259    16500    visits    TABLE     ;  CREATE TABLE public.visits (
    id integer NOT NULL,
    session_id character varying(255) NOT NULL,
    page_visited character varying(255) NOT NULL,
    visit_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_agent text,
    ip_address character varying(45) DEFAULT NULL::character varying
);
    DROP TABLE public.visits;
       public         heap r       postgres    false            �            1259    16499    visits_id_seq    SEQUENCE     �   CREATE SEQUENCE public.visits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.visits_id_seq;
       public               postgres    false    227            D           0    0    visits_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.visits_id_seq OWNED BY public.visits.id;
          public               postgres    false    226            �            1259    16513    visits_id_seq1    SEQUENCE     �   ALTER TABLE public.visits ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.visits_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    227            q           2604    16424    admin id    DEFAULT     d   ALTER TABLE ONLY public.admin ALTER COLUMN id SET DEFAULT nextval('public.admin_id_seq'::regclass);
 7   ALTER TABLE public.admin ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    218    217    218            �           2604    16488    books id    DEFAULT     d   ALTER TABLE ONLY public.books ALTER COLUMN id SET DEFAULT nextval('public.books_id_seq'::regclass);
 7   ALTER TABLE public.books ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    224    225    225            |           2604    16475    collections id    DEFAULT     p   ALTER TABLE ONLY public.collections ALTER COLUMN id SET DEFAULT nextval('public.collections_id_seq'::regclass);
 =   ALTER TABLE public.collections ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    223    222    223            w           2604    16460 	   series id    DEFAULT     f   ALTER TABLE ONLY public.series ALTER COLUMN id SET DEFAULT nextval('public.series_id_seq'::regclass);
 8   ALTER TABLE public.series ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    221    221            /          0    16421    admin 
   TABLE DATA           �   COPY public.admin (id, email, firstname, lastname, password, refresh_token, verification_code, role, created_at, updated_at) FROM stdin;
    public               postgres    false    218   �;       0          0    16446    authors 
   TABLE DATA           �   COPY public.authors (id, image, "authorName", nickname, dob, nationality, biography, x, facebook, instagram, website, genres, awards, "searchCount", dod, "customDob") FROM stdin;
    public               postgres    false    219    =       6          0    16485    books 
   TABLE DATA           �   COPY public.books (id, image, "bookName", serie_id, author_id, genres, "publishDate", link, "searchCount", collection_id, "customDate", "serieIndex") FROM stdin;
    public               postgres    false    225   K       4          0    16472    collections 
   TABLE DATA           j   COPY public.collections (id, image, "collectionName", author_id, genres, link, "searchCount") FROM stdin;
    public               postgres    false    223   և       2          0    16457    series 
   TABLE DATA           �   COPY public.series (id, image, "serieName", author_id, "numBooks", genres, link, "searchCount", related_collections) FROM stdin;
    public               postgres    false    221   ��       8          0    16500    visits 
   TABLE DATA           b   COPY public.visits (id, session_id, page_visited, visit_time, user_agent, ip_address) FROM stdin;
    public               postgres    false    227   ��       E           0    0    admin_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.admin_id_seq', 1, false);
          public               postgres    false    217            F           0    0    books_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.books_id_seq', 1, false);
          public               postgres    false    224            G           0    0    collections_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.collections_id_seq', 1, false);
          public               postgres    false    222            H           0    0    series_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.series_id_seq', 1, false);
          public               postgres    false    220            I           0    0    visits_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.visits_id_seq', 4, true);
          public               postgres    false    226            J           0    0    visits_id_seq1    SEQUENCE SET     =   SELECT pg_catalog.setval('public.visits_id_seq1', 90, true);
          public               postgres    false    228            �           2606    16434    admin admin_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.admin DROP CONSTRAINT admin_email_key;
       public                 postgres    false    218            �           2606    16432    admin admin_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.admin DROP CONSTRAINT admin_pkey;
       public                 postgres    false    218            �           2606    16455    authors authors_authorname_key 
   CONSTRAINT     a   ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_authorname_key UNIQUE ("authorName");
 H   ALTER TABLE ONLY public.authors DROP CONSTRAINT authors_authorname_key;
       public                 postgres    false    219            �           2606    16453    authors authors_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.authors DROP CONSTRAINT authors_pkey;
       public                 postgres    false    219            �           2606    16498    books books_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.books DROP CONSTRAINT books_pkey;
       public                 postgres    false    225            �           2606    16483    collections collections_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.collections DROP CONSTRAINT collections_pkey;
       public                 postgres    false    223            �           2606    16468    series series_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.series
    ADD CONSTRAINT series_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.series DROP CONSTRAINT series_pkey;
       public                 postgres    false    221            �           2606    16470    series series_seriename_key 
   CONSTRAINT     ]   ALTER TABLE ONLY public.series
    ADD CONSTRAINT series_seriename_key UNIQUE ("serieName");
 E   ALTER TABLE ONLY public.series DROP CONSTRAINT series_seriename_key;
       public                 postgres    false    221            �           2606    16509    visits visits_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.visits DROP CONSTRAINT visits_pkey;
       public                 postgres    false    227            �           2620    16435    admin update_admin_timestamp    TRIGGER     }   CREATE TRIGGER update_admin_timestamp BEFORE UPDATE ON public.admin FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
 5   DROP TRIGGER update_admin_timestamp ON public.admin;
       public               postgres    false    218    229            /   "  x�-�ˎ�0 E��+f�V��-W�ૌ��<�����|�`2�]�{�A@?D]��j�u����ٵ�-�n5�o� ����\��#���(?7̒4������Nw7���S阦��w��K�&�/8j���L��eaǐ�X��-�f�s�D�k�������j�B�������.�K-ߵ��th)1Tk�m�d��r>�e���3�^^E�-�A������^W�yE��<Z-;k��y��_a�%������	< �J� CL�p<���'�N�g��hOPlL�0� �eh      0     x��Y�n�8}V����$ض��e�l��I2�xv�P$խX-6tqO���Iu��vfw$-�(��ԩ:� �� �Ri���(L�0*
�ʰ�U��$N�0�IT�\�Y�+��
�"K�\�(,�[5���K��_����sB�r��Z��Ȇ�4���ؖ������z�$�a+�u�cۮ�G�[�mY��~PMϚ�^��+�XVw;�"��M�K���m϶���]�Y���R���A��n�zl�z�(v��5-p�w�
_u�H����w�r�;�3��c��g���S�c�wJu��6�`��Q]ˇ���jA{����pz�}�x�U�eH7{ܽ¹�~u|��pr��������>�a��r�׮u��Z��[E�`�t������\{���_�n����.U7��F�Ղ]��b��B�ߑ�d9v����ܫ^�Q0���܏��a���QF�*�\?ͳďx&D\Eq^	 �
ˌW~��O�R��^ (��
ä���y�zU_�΂+M΃�<�zd��� ���2�ߌe�!�"�w2�!=��ݽC����j�]�� �_�.�n�%�Wzl%^�_�5�Î��P얶"��\����n��&DZ���R����4�mk�<0[E�[��-�iלI%�E���f�U���Vð�~�z�a���ׯ�K'�O&�����B�Z����	k���8���[�yb:�����K��?������n�7��>������yw�U�;J����K���s�}!�`/��@�!�>���^D�����X#�\��aIJm=PDZ
�C���Ѕi“�����"Ns��EU�0�Q$�w�$88HҼ�����J~���(��*��
ɔ8}MI�T�\Jd�{�og&&TM��$���z����'����e�,�l&�!����WD=l��Z��2�J8�`+-q&>#�XvJ����d`˷�&�t5 ��_�Fc��Z�r.�%Mb�kI�V��r�Q+����n]]��A���==��9@�P+�_݊f����v�Uݬ�C��em|�����/���{2|��*������TDD�Z�j�|����kɏP���P�M���<p�S��p�/��;��d����eO�?��9[W"S�ֶRM5�bd��J���^)���K������,�#�$���J�JB�<�yǪ�K��eȬ�}��_iP&�_�_�<(�4�AJ�j�Vr�Y�]��m�i4�9���8|?�LD��e��t��{ ����xNYl��XK٨s�F*�ޑ�`r7Y�S.��J]N-\����kr�G#�n.�s]K9��}�(p 
FcBk�KjF$m��j����F��4hd�*����O��ɭ�����~M���/%�aA̠��u�����:\p��{+��I7#�T7��t�H���RI"2U$I�/cQ�9QU�D*QIeAV�R�!��*�"��t�zÉ�ޡ��Eq�h}���sZJ(&��#�=��"|�i	�@գC+�m?r���u[=p�ñ�%CeI��-���U}�ZnG��$�d�r������;�ɉ����xљ���0�����ɘ�N.��������0��z����5RQ����r��f��q�e��mPdŋ�ȓ4�|UE��3ABM������*+��(��$���*ʂ�(J��T���L2�%��U��t�`�`��&��ԵPrK��������ը���X,��x�4Sv�휘Q�K�45v��S�O��^��λ`��T�qc�F�����?"ȵ���xϒUF��#6Gq}񴡓`�6v�%�gR�n�A�����$?��z`���}�r��C��Yv�r��s�ֺ����F�j$�Y�N� ����*���h��M3���������/�$����]��D������wt�����땆Z�D���Tܐ�uW�����
5�]0�&y��=��aǾ�EUE
�GQ�"��H"�x\�$�J����2�#�0��He~V���e䡼��TJ>��t�t�N:?��C>�Z:��mՌ��!	����4W�7�0b��r
�]I�=�И���|��P���Fo� r��5��	F=�k8o���[v�x��6J��M\�KD����IF�-�E���f��9��ڶ�5x�~M������-IT����;;0N��G'2�+=6�̬����gm��wvtk�(��S�ղ�e���d,� lå�*Tɤ,�8	�'eUA$J�B��2-�̻�d���*�s���@�t�NG	�d�I@.أ��)�B�o;��8�Z�v"�n5���mW0��2�7D��N-Y�LJ�r<8�N�L<U�L{��Vf�uhY��c�!���KR�@�"�"�2��(
#?�DT��,�R�?J��PHD,D2�����ݫ�
�Q[t����M�0M�{̺�Ѹ?*������#j����{�f�S�%��;���5��=�S(O��e������ҕ�42��T7����z�����~�F`�(G�i�Z�祟`��u;*sn�`��j'�-��8W'88�8��7���rF|E��'��t��A�wF:���$�����xa@՘<����X�Ռ�)�<��p�yОhy���*�4I��PC�"W��y	��4�c��?�$q�(V)Z� ���Ϫ<���!�:��������)��0{8�H7�R��FH����:*u'}Z@5ڮꈦ��4�0s̏��4/w+3,�h4P8t��B��t����͊?(�<�����]�T��|ž�_.��·��? �5�����A��ZŃf���:^�A�s��t%��43��$M+v١Ҕ#yE{w�ta�h
l�8s
���'��L�zFO��{�|R����0gq��Q#�6���hWv�x�����=S8;}�p���5
��i3/�\yȓ�JvY�9dJZHe9-PT$�,�
c���O��
��%Lb4k	���3�����W���]_��JiL���:1����q���͆�`�	�c{�*�I�h�T5H
��L����\���ϭW#��M�U?[�7�N�t��8WC	11�����4�y<�4N3>��}Vt�A� �~
�����M�}���Yt��a�ߟ��P���E�pE�S�з�F�LOܫ��.��b����v<\��c�}s@j�$L
Q��}!2?�K��2�m�K��3T�o�KX@|�\ �\�9�NQ�ލ��˙�Rm�n���_�����Gf�O_��;Սܿq�Ȉ�4��z�UС�����~�z��+�.\�H�!�b�5�A4#�Ɩ��ZB�^V�<�`t7(�pD�\6�$����͚���U�*I��5������s#�;jg.�G�v�?��L�;1�X��dc��׮I��d�/Z�oqSCG}S)�i\�gfT����\���η{w�&��6���f6�<��;�l� ���2�=�W*Vj/�~�������M����׫�������N���c�^^0��ޒ~��P�A�"{��0���2�f[����i�0�K���6s]�!�'�J�- _yi�2��/^���?�y      6      x��}ْǵ�s�+�d���r�8�I$%Q�ٴ(�8��q�x4i�������%w����� ��r�aI=!�2sk��{'g���hy�1�P�cj�ֆy0Qk�~)��
�]΅�Z�vV3^����SY~^,�'�.���b��X'�d�}3��+��&5��a����b�\,��\~Y���K'��=��p��z�q��o������e��b�����v����!���>a���R)��a����;��s���t	�CrLU�+SƧ �Li��W�bz�c~��q6�8�t�$���ż|�gR��
����z���N�z���C��9F����ܿX,/Üޜ)���K�9ޝ1��G\%y��N^$#e4�d�03[�g9p4cՆ�rLQmu��Ke%&},"w?,���<wJ+m��Ȼ��r3y��^�o&/�6���oz���a���V�o#�g����p�7x}�����4R�N[jr�g͕T&)cD�	X��� ��UD��ɧ��w���8v���j6�[�����,�7���z�Z/hjgK�����S��洑�7˂�,�Ul{a���\���DJ��dJ�A&�S�b���V��
����u��m�L%�\şbH�X�����d
���\lDj�;ߏ�ͽ�=�=?�/4TOCA�>���ɗ��ŝ�vY�w��˿���������^�i��������{���=���a��no�rRt�ᄤ�lap�I-���W��i�����쥯>hY�G�Rvg���dQ'gW�0���	4�{#7B��M��JS�[����A�HGT���V��7��������O�MJm��^l&jq��]�Z��2����h钇=�Zmj�����"1D��¢D�|r�R�x���j	E�\.��/&Oò��_��i
3�]	�eYу����_�+mM7̾�<�Wi����cƽǕ�=����S�����}��<a�̫'��X�cl���I���S
,��=���4� ��mQ9��<{�*���Zr���٠t�5�6s1���� `��P}K���٬4��{�z~t����#����0���Pmc��Ik���\(�:�`(���j&�E�*<��9��2ea�X6��F����,w�V���v�|��������f�૏�WZwl�q��[V�޶=�5���<ϭ�� 	�����6?{���$�I���"ن�2���T<T���`��ҥ{��/~3-��a���v_�OeN2s�IC�
�a}ˌr@`)��],��Lг��e,�	����{	��*)��E�M6PDT�E�:��2_�IN3�l�5�W􏂵��sY�&?��=Zu�+��Eͫm�������q�~��y�����|�{�^��	�ı��?�{�C�i!9��+ (fI�&�Z)b�&S�D@�P]5"H�-��vO���c���?N~�]����]~�#�v75!���{DV�y[����
0̏��eZ���i�o�K�!	�������D��|�,e>y=�����y������tU��=��v�������5��1�o}�,����^43�`=M�M3���J�7��o�$3��p~q``]�X��ʨ�ZXďu�Y� ����(�ܒT�ʐ��T�
�.`�P��ʴݠ��m�2fz���0����{�mI��`p��>XR�YZ�W�%;�JvtʈL����ԎØC�XQ�!4~Sd�8�V�o�ܭ��M�1��B-�|����ͨ��Ŵa��o�z�_
�y{-`rl��Zp��Ic���*.J�h��[S:��k�4���s����[1��/��VR � ,�Y�*@��Z�v�O�����p���/�/O^�)�d6�ȇ��l����"�j�R`�\J� ezX@����)�`!0���
�W��1#�=��U������jBtf�^��~���w��_?���b���K ��v�//��xP7ص�
Q
��a�3d }�VY�W��/��7��@��g��YIX
6I_w����矦�� ��S�j����}fl&�Q��F�i��)P�b����2F6*���wIk ��	n4 ��d�H�Hd@WXu�� �V%)k0
Ad-M̳p��g���<�]/n����e~d�{c���'�z�@}��M�to�f`
�Pzk�I����҂�����E�7Ͱ��E���R�FY�		&#�8���{�4�}}�$}6�NE�a�k^���B<<�o��4��M�`H���p��㏄0��L���c	��tuEˊ��>�X��SЗ2W8 V�L��	�H8������@�~_�d� 6����n�jXF.�m��ƕf�i�I��b�Ëf���[��A�e�$��<1X�J�������rq��<�]��[,vZ4�~s?��a��{8��ӈ�f�������x"�۵��67��E��"E���j�X}�`�(I�wXD��(|�`�VIi@M��-yr.K��6V���NYZ�l���J�S�S��m�) (Io������Fr��\YT�Q�P�� n�JZVs�и�]�2bj!F�]�i��-�j�y�,�`��)�酽+���o���J/�¿�I���6]�@��Z�%g�1�S�0H�oTxJ^g5�$��*����+p��v��y>=�XO�,��Ϋ�6�������܌�o��O�m����^�р� 9B��!��0z���:c�@�XF�Aeܣ�>Yp~X��=��� 
NBր�=�83�<�2l�ٚb�[T�f�Z���v���5!�}f@�ܑkB9����׋O �����|(
ԀE����o+(­E ��.�X��*��I�*�L'�Z!�M�J.���a�֫?O�!�x��3��&��/�l���j�=y�[a?î�'��$�6�O��q��y��Y��9$� 	|	�T��k�+��O�=g_�؅�n��)�;�`v����X�	�U[�T_\��j�Q]6;(���� 0Z�Ӌ@A��U�f����N܏ӥ���_�o�3^��BϏ����~�ԑso�b_+�x�恢ok�A��U
�������Ig�\�*��F��`���h�B#���2�Y|� �?�s"#�7�>� DѰ�8�~>���k�~���gp%R9��.:� 2�;�j2�jx]�A'�/���1X���S _�ڐ���UxLUi6��b9�\a���f/�&�9J��'g%-������v�ء�J*��_ӍovQ�CqPFA�X���������6RUk����/��߇?��i�}�o�
��a6�x��廰H���wu�C�X��S��To�{|����vO���U\���#��U���~��oO���˗�����/^���Q������F�`�)�md&��0�Ɏ-�v�27�\��erݫ�jq9o�@��7�9_T;C���t3��ȖR���
c=\.�*��0FDF���f�"���ʪ$�V���@YLе(c���%��b�L���jV cy^�8'|o�oc:;Rl�Y}�
�d	/�Z��9Yd@g9f�@`���-~!��du�&q�.��[&�.s6i:q�����<��������n��Gpɰ"����"l�5on@'��e�&3�ی&
��*H6cN6�
����M��u�1� I���$,�h�H
:�.���z������E����_�7�귏�����Ǜ�x��a� 7D;�-P0��XHA�S�z�9��Q��%�j�`��.�s:f"� �8m���^�o�f/�im���t�ᙷ�d "���>$��"� ձ�� �.I���B�d��cQ�������B9$x�\����/@_y
1��f�����<�<q��v�6hH�jx�aw�P�V;�y)�̆b`zF�.�Ҳ\L�� �X�P9��:i�	��
b�]�2Ȅ�6w�|,s��N�J,h$���m����~�u�&�t��*_}�2�20u`<�*D�!V!'���Īj��J���	6�K,	` �b~�E��Σ��7    ?u�������흇�5Z8�Ξs�v[�D�f1.}N�R|��
�����@\Y��}�P(6��t��?�ZM˿8�D��P����=b���9.�ވ'�`�x$���H����ٚ�-pF-�B�b�oc;u�H'��`Y'普�tM&�4��"���)�� "�W�5ʁ��
8ڝ[�JO��|5?_���9��w+۷�\i.���=�+h?�V?�S��mc�(�W�{�Kd5�
O2+�+�"T�W)���� $ٲʌ�)f����0�@ׅ�zO���b��:^�
���x�����ಘ8��n!e���!ez�}��ĖX�Ў���"%��L����� o�W�R�F�(��⋍�eᰄ.����5	-�ݐ�-,xG@,0N##$�G}�5����7�v���8S��:�-��c���* ]���.��,�6*�@4]�� �0@O�w����.�Tr�y�?*�Mj���7�z���7�g�i?�l Zq1��L�iHE:�y��7/w<- �l5P{� ����
�f��(�����q�_�8�(Q��A](F[c�p;Cڔ����=�BX��ŏ���8�~8~�(�f^$
�
N{�4�����3���.XQ<l�։2(;�$��#y�"E� ����0��у�F�zBO	p����po��^f��՗4�$r}���#��Q٠a�A�'!]��O�ay��k�ZJ�U���$�R� KLGI��sh�|��
	3-�����e�Ǫk@ʏ��W�s�vȀp�"�8�F�i����}[.�q�p����Θ�4>�1�-��;%`\	�p�P��2�2��@��J�%�B:�թp�;,���� �/��19�l��������ݡP�S�#�7�!}��/�N"V����#��#�� vRL�;Q4WQ�h�1�m����� �:�B�Ҁ�kYy��joP�0\@:l�_�Y퇓�7�)��_����y���=��K���Ɯă��`q�1���K5�`�3A�*�l�U�p<G��������I�����d�:���
RA_�3�1y��$w��������=�����gmJ8ۜ�sr��9`1eЬ�J��t�-��F��υ�dB0�5�JV0���b��I�7��|�����ݖ��z{|��<>~0�ܲ���n|{��<i��t%��J j��3*���IƢ�gp7 3ɀ���T��zF�>ZOr<[�����O����յT��ZVY�	xl��m+��:�JJŤ ��65�6&��t��	M�ԃ,��G(w��r�O�M?�	M'����|qy�C�S�򛇄����:'T����9!�ς<U�1ڒ�����K��)V�INd^�c��Gc\N0�,i��p�˼�� ?��ui�(ؑ�(h�в̱�v�M�� kڀ~Jˠ�q�H�=���o�0�0�w
�]�a `{ՁJʤ��WX�j�w����@��U��2��+ܴQ)�r�̙:�(��^����}���]��\�����i��p5[/���?�B<}�������W�W v�5�-����BF�}�F%��D��D���e��U���� �бT�)&�tO�^�?xu�����UZ2.���������s���%��˪���T�3��Z�3x
(���;] �Yz`(~���,xݽ����],.wѷۿ�/NQ��G�s+��R`�b�Z���,|ܡ���&���J;��!���C;���$��"�6���!�jY_���?Ȁ���4��a�	%� �����s��踖3l�ϒ��ܨ.f���fJ �+�YT�,X�0"�l��6k��U������� ��c� X<M&����#���qwԆ��퐸��rk�؟�q��FS%P�H�`*�_����<&W� �B�Hss��pEI�:Խ]���B��Jk��e���=zl?<�tV<�������y�9�Bl)�{�
B� XUR.L' ��FJ@+�5rE��S,��4�{V>Mg��MA�<yLaz]�{����$��R4�R����V#!܎޷�5��C��۫<g{"�ז���`�N%���8�\��1[m�U�ϒ ��Tg)�"�Ua�^d�Y�M���)4���xL�j�e��ڬ�$r�ҏ�я�q���g��M��h~' �[��b+@�I��t���Z2D�%h��S��V�&b)A�!���U��X@(����1X�� ��n�q�,o:��������3u8>��9ye��FI�@�Lȿ�.��:�qP��q�r`���p�?vpo��t�G��S��"P�2��Q�<ڷAO'Dk8>�ۃ�b!��@앢:����k�U[X��� Z�S@�!�sE�Ys ��bg��0ą~���%M�b7y��+p' �~���É<��vW1�u�e������n!x�j�)f0�@4�`0.�T�*<��,{���e]_|\�yB����G4�ɫ~x�6�vS1�:8F�ƕ}��G�,Ɏ��"A����*�REHN�H�sT� 3�#�9���U�>c5IH�P9u5_���^������d�c�ݣU�0�*\�f��ܩ�]�Q[���|� L�O���2�F��yV`���C?V��D�=�.�_��[��.D2��WC$�'����������/�}ֿ�����?�O_���׏����޿�'�#(0��$���'�x0�{<�$K�� W��:R
	���)�3T��w<-����X#�5;����cl�\�x�-`�=3��ӧ���@ � �U���<_i�I�px��|�T P)6�-Y�/�0�p�bǝ�f����e�L��f��]��+Ń�Ǽ�x��?��~y��m��ի���w������l�KB��wO��qO�C��9�)<9���s�t�`��`��+�T�M����9�EJ�p~��9N��/�6~4l��h߅�����~x�mf�Hg1'���hH��;��� ��c�9���Zd��1
/ �L�0����T�JR!Eގe���l��b�"����e^̿� {�7�쏭P4�t2���x�1�2���U�
��=�9���)�
�Qx��UD�9m����pA��TYYR��fˡ8�
!J��/C^��m��u>��q 8�mϷy U�i��3�ꙻ�D�R}^��M�	����$�l-����R�W��@�P(�=��t^yx}�6�E7`ߛ �F�e�w�	�C�aGO��e� �5��-�a�j�J�F���-��$�r��a�`�}b���Bb�=�[�x����4�~��ʗ����j���*η��uWpB��3W#�;��%Un���S���BZ+���g| ?X��#$g���l(�'F ��eI|#�j�n��e6�Sh���U<n�;;����<��g�a��4���EA ��Z���{U5�x�T���R��(2��Xv�H-m�#	����c�0m��]zr4�{<�f���e.7���s��Pu/�&��vQ��������g�5{
�&�CV��`�cr�������&dD�^`��d��a��ع�A����X�8{@f�X�Dه�ZE%���Q�a*�as--l��%��k!�3�&�A�-�8��r$U���?a�"�;[\�������pގ�����2�-!R	[� M�j,u~�1�A�ߔ�P�r8R�,�]�Bvo�YY����̰�,㳹%��1<�tu�k�!��r]��w��F�7#.Ё�ê�M/�P��F�NR�+cU�t�D��-���:U�[bfBe�{H�5Z��a�~Ƀ�8�uXNg��6`_�]?|�����]���&�}��+�@��F�T��#�@мM�$�*<<\���ßAf]�|��h*O��e�8���=[�p�Hd��7�Q�ͧ�e���J�� �4�ngA�; ��m}¶�uW�dh�X��%�/Y���#�pS�{���{r	������b��Ė�a��2���X���5y"�jxfߞٷ���!��1�GS���7X�����2^xY�m0q�=��U�6C�^    ���e���e��gv �C�\�K��Q�o��	N��-��ꅹ�����R�X'���:+x^� @���T�c�~�d�_��Y�-2��Ns�rՇSt~Jz��o.e>���������ky:�I���[9:F=4�䱥� Z��*% 8&'��Y��3^e�9�}hfC�"��g0~ ��c�ɓ��q���B�9�����P�%�~(��Y�8�Rۧ�����d
ݵ>��۬)���z� ��B���;���zI˄���X%�:�Z�Ka��qls�dNN���r������r�R���;����ov�JK����g��3O�j��O��-;U$��{�3a@<B��	�{�+����N�j�����i�2��ʳ�X��T�f��Q%�-}�nJ2>b<�Z�������lKZ-�
�f�*�zK��,(HN0/�뾆����k���h�%R*����ސ+�����a�H�m�ݢO-��o��������kD
\c"�)�,iO�Y�5!a��61Q����ԦX|�&݃�v�/�z�ՙ\��,|�)�4ސ���S�o�)D=L�3�%`� ��ir��3�
�9STm���L�g��1a��P�2���7%W�P�|m���N�G-��o��f���k:7cQ����N����kx�#*���SgAS��4�j��0=��
�wW)���u��V�`���+�Λ�Z�W{!�[���|� }�6�V��Ii�W���f��O|�K�`0hk`�a�Z�ee���D��V.Y`+�]�������YX]|ly�{���Q`�m��<����Q��%�ބ��O��R3����V?Ғëu 9�Ϩ?d"���
����q�C���:NѡbH�X��f~lC:B)����;�p���}|Ğ�wU�� �u�ZJ��3[ebIXHL-�G�,K�y�V���S�I�Ý��܉�OW�,�I}E����Px�Z�ة�![<�o1��鲢�)l��0kI�îYM�<��%I��s:8цPL�ZH{&E��n����p�d�ڋ2���A���t��fs ��V��PP��%�|<&V8�e ���g��7Ta��FV ]�8sX�ZS�
�80�ɘ$����Ռ�Ӱ�_�s��qNN%�,�/i�ۜ�qJܴSV0��2ϩ�t�A��[Rk�Z�a�X����>��d�`M~^L1��nw��a���aj����'��f�kێ&Fn�"�A <^>��j^W1i
�K)���Zʕ�7BΘ(���"{[�.�+W�l��t}��Z���G�NE_�0��a��=~<�]_s�u@=q來�8n�6�@��(�M;F ��R �s��+qK��Z$��wЯ\8�G�M{�,�q6�}�L�ۻ&��4~�S�f����ӭ�ֶpT�'�d�˚�h�e"�B���W����d�YR�l����0�A�4T��P��hv����Q����)���X�?�ޘ�u07P�P#u�+���FaS�
���C�
���&Ќ��	�V�qЗ�5�os���~���g�0�BIݴ��9��&�p�����F�U��d
T�S)�9�L={��AejZi5`��Lw>5?�pS�
"4���7+�ow��+�<�܃�h쾍ݿ.�3�_��_��=00�h�p�"�dt��qG�ec��-]AZ�������X:ֳ!�B�or��jy��[�����[��N��9�-�����d����L'(�&	�W�JIXv�}�>@F3 � �ep��g\XkڽrB�ֿ�^�r9�v�]�_0^�UA����t�G��8C�%	������#aޣրZp��U q�dx�,�
2��+��M���Ze#���֦4l���T�XM9J�.\1�4�v	/�J��ԛ:Ɋ�8SbR��A-�,gg����
�����̢{Zf��r�ç�Cs1~��?�˨7�o;:`���J��G�㩇��Ԋ�/"]��T}�Ե	X<����*X8�L�kz��[�ٚ�vǋ����V8�9&�N�*���y �4T	��+��(?h �KA�K�"SUFƒ-L�`��b���Au?.>,:<A��>v:p�~�csz�жt,�?ptފ� D�hP�Y�,����p�T,�qe ���R�T��M��ɒ�;#$�w��0Yh(�Ih�<Y���cy׎4n$[�?��<�o�9�^"}N���1��; &@�-̉"Ӕ�.T$��N��!	���I�N�"��]ձhZ����`�}"��DN_�������t?ڤ�bb��5�
7#��w��Y�,�銄b(��'@�J��2�R_`�,]���!;�}�<���a���ι��t�4��۰}�X�<�q������MДR���DP|��(�`aH"4�~�H%Zjm�30���z�����2�Cn@��]X}��0(Ǌ�vp@<��C�G��D�*q<;exݖ�M�0�k��j�j��A�����JNy�w�*V5q�<�nKB��Q�^f	ɹL�tP�ǲ a~?�'��'��bV��=7V�N|;8��7߷��s�]��"-���p;�EG�0��AP�,"k��x7�̸�1'#+|]�"P�B�J�z�������5��Y�4t[����ֺܵ�Ug;��,o�����TK�;ǝaޙ �)���U+��Y^E�*8��~2�0U����R������a��g;�s�6��Tj�q�wp���kG�j�f_6����E]����jW�60�L��R9���]�()G�A�ϐä5���O�rT�����R:�'�r��ܞ��Zpx������ѽ^Մb�&�R�|Y�T�m�f�m��x.��5�b�$
��^����/%O�w.�ͱ��Ø}�th��>�q��Kꚝ$�������ڪ*5��"S��h�`
�Lt�X���-m���MӇ���zJ�CV!M����i�W\��Cn!�%~`K ��ysF����Aӣ
@�tf4��%X��\���6�ZJ�s����p"��՜^
���
��y��%�F������n��Yg���XX`��9�����vQ&í� �ʧ��F;SҚ������;�&K _��������g�e*˲�cK;���`�o.�fW(�����d��^,�9����í����ZmEs��s��5�Wn����-˴g��{Ht��틾R���F�ʬ��%S�)}P��	p:FK1]x��{͞w��yf�\��a���8'N�7�;��똨U퐍�L����p#�E�wf>ʘdJ��$��Ry�Ѭ���P�1M�����SL@6�@s��\�W��h�ζG�h:N�6O=����,���s,T^]E��(�NQ�%sQ锰F��P_'���\���<��1f�e�VE=�V?�JWy��?�x����wQv�1���ƺ�#+ɒu���I���ޘ�}@��sL�R�P�J�dH X���C���y�����--��??��s}ƚ�;7'�܏��;ewaš� tw���~k�2��uQF� D�����?��u���ȹ,@�ؐ����Ժ�W�5]o�}iG�V� �nE)��~�c�OM��G���]���)|P��	~�(O�+Z��\���V�c������2|��Œ<� ����Euy�=?jt�ի~|þ�ڮ5!���.��ٶ0�p���BKX.p$O5"����6Ea�a<���~�T`U�&��t$yz�>��K��#��({N�Ԓ^Z��Q�5}����k�:H�u^��Z�1�P�}��
��k�2�=R�RM7XIj�Y+,#��wc��c;�5�y}3�s�ͽ�]�|����6�c�^�+	�i��PV5��m�h_�ľgꗦjՌ.�����rR�!Q8��兮}��9������|u���`�tO�>G�`�{�y޹n��GlФ�����$]L	�@���5p]4?���6���T�J�8�;G�FR2iY��
X�����cGNA5���k J�����B�z�<RI��;��"ZNq�P���Q&:��6XW�� �  �B�Q�o�8���<�����6�%�N'{���?�?��pt[�Er�g��:E�NG'TO.(���i�"�Z�{!i2����	6�k<���^}��|/nqI"��}8/����;��9����j��,��Ib�E��*JN����KZ7^1���D̔ta�a�O�"`SVk�UH�����FW^�ڷQ�6���c �=aU�ڡ�EX4	�c��O1d�u��D�#�q�t|����"ZX��	�����
n�� ��l�����G��n�����7(n���v�O ��X�����	&�^�_W\�#]ǪH�R� ��%�mK�P�zf'ʜ2Iх��RK�\����G�����+ӡz�}K{���ۆ9v�
�eܪG�I鮤
�g)q�gG�t�GQ�+�uU�`-]�BsD��´J-B���-ºy�e8o���QmF�ޞ�����ӣ�``��􌲒Z�?���3U�⵩w��>R(0��]����+�������Y���r��V�'`�0V��d����k�~:X[N��V�T����c<3/F�Ɯ�s6{S�w3 ����)'�YU�?��'o��s��Ocm��ăۘY*{tB�v ���,1��V����*��n�Gu^�@٨�T#���S��{�\\�Yɓ�w���p�Kٌ:v3>u�;lv�� �v���`0=EU�-'� �lr�g����Y�j�(8�vptiGpuL�o��;�>��O\h�N��!ݞx�����c&z�ò؆��,�7H8�J�!T)i��%�J�,�IW:�̙��h���7h�z��.����\-�P�1}�t��ԓ6� Q�h�Ä{��
�ו�4<J�j �``��_jP�
+OW2j/�KɁ�W��|���fmQN,Ơ*c��띖)�nl3%�LwQq7�;K��͆h�)��L�Y��5��?��/y���0�,|GE��۫�����wT��qz�����`��4s�x'(9�)��L)<q���`��U��P�Kp>[5僋�d��e����U9����Ǌ+Z��x�lx���u�Z_<%��" �6l}:��Ɋ��8,���BƑ~W3�"�O{�=ŴW���VXd�b��^M|�~�hj>��o��;o��թ�4�9RQ�wFT�Ь��`����>�hm&_n� ��a<�|V�7�}��3�oK�$ҷ#��ŭ��nȡ����̫�~��K���R�QE��=�!��.�[+��e*VA叒'�)T�Y�M�pG�9 �0I��CJ�W�!c�d�M�ȶ/á���;����/&�d{�)��O;6��+�x���(�Bq��<�.�;F@7��BW��kV藕פ@�����J=�-Ѝ��O3����"��Zז���a�=J���oeh�5,Fz+�.����Q��* �Ԃ���87���!~D2���y����r1�"+!6��+*c�W��wuZÔTK�9ڢn�R_��=�
���T�Q�\�N����r�ih�%�%����I�J)�i�ORoW�\ڵ+���Y,������b�N�V)ֆ9~˃s�w�Py��`.a88����%���� 4�D��\���',KL�@U�����S�z*��졶��h�a� �U��mB���I�b�
D��0����K�A��L錧4�
@Yh��%��BS�O��Y4�~P��='�����q�o���7s�9�V��T*�� 2Va�+ _�Fdև�*��}G�X���5>m
D��3��Lדǳ���=��;769ѩh�{?�2�$I߼]P���5桰4WX<��\d�	����9��J� (��f��Y	x��X�ԍ�|O}�[���߼B��&2'��@{��Kǚic�>��G��w&Qe��Op�n���6q���+S�V�,�6Iz�Td(y���T=�ݺ#����ZW��']�Y�՝R 8e�<��y!-�%G��u�TMuV��D%���!��#�ܚB�g�@w5�.V�6�g�W��֓��o���7����]<A6��FK�9��R@p�  2�w�* }5)����y�����I�!%J1�ݯ����5�
hj���Q}ö=�x��;u�I]�K�1��k�j� ���eK\��DA��8:��ycL��k]�X��#(>��@�Z3j%��'k�� ����y�}P=�Vډ�-8���W���@�%B����=��ujb�с�{#h�ړh�P���!�kq�.�2��2����B/&	_ Bhc�U���{|�����a�o�w����CK��1%��$����Qa�i��Qm���/M�؁	J8�PcT`��� �SQ�)3QA͕�ݫڮ{�����Yi������/�Ͼ��V�6z��aڇ�Āѹ�gc���Z=�Z�e���*L\�p�VUW,'���D�t�8���m�]��)3w.�L��-��f�#��|������y�3�_��Z��ǫ��/�<y�����G�ڐ�.E 1�}��.J��2 Pc����"X��U�$J�"{*�*�{�H��vf~�Z�$�]�ߛ=�j1��/Wިoot4�
�!H�w4�mt ��jhn(<�ȋ�����SJ"i���9�j�,��DG�_G y�aW�˝<���ۜy�Br�/\Ǥ�����[
0=��1Yk%v�[w�)��c�錭J�;�(q5�૭�>Q�Z��fO��9�p���DVkUX�|��vR�Μ��s�ź��{C����C˲7e��2�f��y���ne��ܜ�ޛ�n���/�O��.�ҿY�U��g{w��~���;��!+���CL�}�s43��8OO �\�4	�Ŗ*��r��b�������?+�K�5$8�/�W���i�V2Y�%'�7�U���m*����a7�W�nj�#��W�RYXǩ�,\1+^n/���	*�c�p2T|�8�`;��@}D�J)3�eÿO�'{�&M���cwc�M[vM��
���v�@Wv8.���jS�)QdTP�<E�4��VݸX1P��n�"��7�W�����p�;α~������_~}���׷Ϟ�퟽����og��.�T:��`B�D���(�՚
`�P��Y'�)�t B�̍�!�����N ښ*	��R^µ���j��b�������Y�r3)}k���e�r�H��Ma��U\��=��~*��5����B�R�m�*��F%ܣ��ӣG��?n�X�      4   �  x����n�0E��W�dy���%i��E� �2��؈-�T����N\7�fGb8�{����(4�Io��T����!0%@���N0�V��\�o�!MS�۔}ȡ�q*D2�sI��8�rh��*�>N)�C!�iڕ��r��wvk��si��Z�-�bH�eQ±q�w������"��� p��\>8�۴�7��X� ��Sn����Ƴ�2�B�4g�!aL@�!�
��F Z�8jf"��V;���4^�����ڂ@�m�2^�\�k�5�y�s����꺎�TW�(�oD_Ƙ��e�MK?�ٽ]Hu*��,���ƹ��s<A{�<
���t���n�<h!��
Y5
+�I�Amwv���yO�ޭO!��S��Zz�U&s�_+��F3mP_���e�rBpnm��C���ʺ��G�ե��eZ*v��Ч�i�?�D�      2   7
  x��W�n[�}�|O9q%�~i)�2`c0�؀m��кB�K����7��Η�	�I�{��t�l�Zk�1�s,&<������!���{��8j'��	)�u�j)�eLbe���+�%Ͱ�5�Ua|"	c�'<��\�嫳Zo_V��'	J���%�J��,Zg�!Xʽ0#a<�i*U��f�	e���@�����+�������7U��j��%�s��jDQDQBo�y-�Ue��Ym�E^�Ֆ�#ͪj]��˗�n��,�k�������RG�\��}��6[�l5��6�PX����z[N���j:)vդ�դZ����g+(�Bh�h��"�h�;��B\j�7���=F��us/�@ތI�l͢��zf�-M�����v��U^d�,N�2ʅ�	#�Q���q���p
M� ZE'����j�R�o)P 	ex�&醼��d�e?v}߉3.U�-�BH�aE��SKY��;G���{�(�Bs�����Q��I�L�kS�Z�Ȗ��B�����w��:��,�?����6���|�|���Aֳ�J����a���{z���z,�FZr�N�hZ'����Q��C���2�=�z"R�`Žc䍉Z�\p6� uj��>��䤍��pVd��t ט)�pG�L�)U؉��u�y̵�E���uN�3 WO-F� A�pj��&���2$X2��_i�Vn��+Sm
`�S�d�N����C!� ,נ~���Q�`B��	
`s�$���܅9�&��#uRk����U�-{�����V��*���t����������^(\�L/��P�G�@�i���C��r94&��Tn6AL���G�F�K��9�_?���7�	�� ϔ�r�6��Q�&���}������m:�BNi�VI$D20�Z�5L��+0J~��'z:I(��GO4�Z�#�� �Zx��$ؠ8W�z�63 x����� J���#��le�7�:�f����a�ub[�ܻY��Z1�iٔ�6��i�,�'���o�D$��ЃD�hY �a��
� ��d�Da>g�`����10I��F� �F^,�¬j����!aX+�@���/��}�_��2[�����"�X�t�-�;x�P�Ƅ�(�G"��O�>�_þC�Oy�t�����uժ:L��}.nf�V��Ӿ������E�SwM�Sܾg�����h=�l���z�t�3�w�C�Hc��������9����U|��=�Ҽ�6�e���mYܴM�9ovK��nM7������q�C=os?�6�Yy�\����t�ڠ�o/��&y|q���|�͕�W��|Z��]��Vfn�Yg����qt�z7/뛸|�ӫ���y�>�e������r��n{�����}��@������ɬ��v7�i���_��U5�]�wd�2�iN.R�_�/�m���?��w���# =���k>����˯�]��F�O�#��ƒ@�RL���U�B��0�JpP0�`.
/2"0ϙ	�2O�dQ{�#:d0E(W�x����ӛ�"+�0�ߣ���I����+����~���`�`�$�0�8%$H�!�KÈ����+�#�	���8%c8�c��"M�,���w՜LG3 Ѱ��a�*�� nb<d8�����
&ĭ�0),�V�K�h	%�0�?��$��M؂2Nc$�N�'�H8 ������i��0� �!�L��h� ��؇��X��)k��P�{�����-��۟��l��U?~?Ua��[��!I��[6j����a��@�����G�t�(,#��y����X�o���3����ċ�ڏX���N@0�H�(��=�z
��s��m���c[j!�C�LR���{�`rq�r�I?�`ן��#j�����9��߆$��3�9�օ�1��U��U�)\��ϏG0�� H��^���KW$>4���/���'�Mz>����|xן�d���M��n�I1�>����-�#��v/¬�ͭ�z�������Ll��.���yy�2�o��w���PmF�E�7��������>��h����v�g�ｴ>��z��N6�dR�w���Z|x��s�����=6��Դ��`:��k�;�6��&+�z:����`�����s�25���wrV�:hpw��Eq��^V�Ob�y�w7W��g����^x�����f��*	z3B�@��RR�Ψ�
�3��	��j@�4A.� �x�_a!�H�	X"5no�
C�
a0�Ba��Yɏ�<Z�0��NyC��-B�u$�_&�;�N��;zVI�+��H���:TǸ��,��ߙ��/�3�_��~�W��k�t��J��/�ް�9gO|��|����n1���t�znE��]w���bt�����֯c���v��7{����]�7��Bv�x��*��gt����%����D�r�u�	��|{g�8h��ˑ��,��������z1|w]�ݴ������vs������rv�����]/���`�/{2�_�&���g�t�0�K򰼠��yώ��
��"4��u�j���O�U�§���Su@��T�P7͏����*��@.�|���>���0�      8   5  x�śMk�G�����1�z5߳��TJIH�R�@.�(�Z�8V�]���wV�%�}%�ddx�k���5��_~��]m��w������d>�O�E�Y���ݿ�77��X={}{��z����
���U�����o���|�پ�~xs}�V�¶z��ջ�?}�����]��~��{���j���]#��g�������?9�&<�1b���F�)�2@���k1n���CD�I�0`�D#��X��+� ��p\̽YMA�c�6��9�m��8)k@9��0F�	��(x#.b�BdY���Uh��q�#��F�$Ʊ`:#�R7���&5�D�Ǌ�\�Z�I�cǰL�UrL�c�t�=@9���	�V�M�\M4�]3R��h&c?
h���	F+�U!i�xF#Í����z�gt��>:b�Z/����ب��GZ��(eZi���0�=�8�A�)�h��{Ī3�0�=����'�k{&�n�ƭ��<�������XN��g�Q�H�c�4�c�h��r�~{F=R�bX1��8���vO�-)>��3m�Oo�XR|�g��&��Q�q!�<��c�ז�G�i�$��2朴GF�	F�}�*3�2�Lo��У(���8�L0�m!\�G�	ƃf�5'<�H3-�No�7'���2�p/����'�n�-C:	0H*�e,� "4J��d�~1�-�Wˌd�nR�֯6��?�����G܌�^������,ᦉ���Ur�[gd������Z���p�</Ju�!茴�pS�1D��u��3"[�͇�L���l�7v��u���&����5)kU[ �Q��ͳN��@�[%Y��mno����\�����&^k@�4��4t� &���y���h;=>RL0�h�cx:�Bn�99�����/oC�fI�t2z��SŬ�W|2z�5�#a���SѣD.�.�alΐ��#���M��缹=�n�E�����؉6t�W�1�-�j�fm�$������fy�zw��ru�r�����x�/�!��gѬ�3��cAhOɨjKz�賆=n�]X}��>��#��D���rR���q���$P�1%]���~��x4LJ:}V��"�m�B�j�M��*��A�!��E0�c�r>n�Qę���~��G����E��8���O�u�E�w��dYG�ɾ�A��PŜsV�>���_DE���K�9�Q�x��x��G��#UHb�!c�c���<i3�Q&�R,��Tę���H�R��؎�L��X�uj;����ܒ�O�S���%ݽ�Ӻ���N�@��G~����9�J�8��Nk�zo(y������^������r9     